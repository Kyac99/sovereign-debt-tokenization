const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Base de données simulée (shared avec auth.js)
const users = [
  {
    id: 'user1',
    walletAddress: '0x1234567890123456789012345678901234567890',
    email: 'investor@example.com',
    name: 'Jean Dupont',
    country: 'France',
    phone: '+33123456789',
    dateOfBirth: '1985-03-15',
    kycStatus: 'verified',
    kycSubmissionDate: '2025-01-20T00:00:00Z',
    kycVerificationDate: '2025-01-25T00:00:00Z',
    registrationDate: '2025-01-15T00:00:00Z',
    lastLogin: '2025-07-29T10:00:00Z',
    isActive: true,
    investmentLimit: 50000,
    totalInvested: 8000,
    preferredCurrency: 'USD',
    notifications: {
      email: true,
      browser: true,
      investment: true
    }
  },
  {
    id: 'user2',
    walletAddress: '0x0987654321098765432109876543210987654321',
    email: 'diaspora@example.com',
    name: 'Marie Kouame',
    country: 'Côte d\'Ivoire',
    phone: '+22501234567',
    dateOfBirth: '1990-08-22',
    kycStatus: 'pending',
    kycSubmissionDate: '2025-07-20T00:00:00Z',
    kycVerificationDate: null,
    registrationDate: '2025-02-01T00:00:00Z',
    lastLogin: '2025-07-28T15:30:00Z',
    isActive: true,
    investmentLimit: 25000,
    totalInvested: 0,
    preferredCurrency: 'USD',
    notifications: {
      email: true,
      browser: false,
      investment: true
    }
  }
];

// Middleware d'authentification simulé
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token d\'authentification requis'
    });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
};

/**
 * @route GET /api/users/profile
 * @desc Obtenir le profil de l'utilisateur connecté
 * @access Private
 */
router.get('/profile', authenticateUser, (req, res) => {
  try {
    const user = req.user;
    
    // Calculer des statistiques additionnelles
    const portfolioStats = {
      totalValue: user.totalInvested,
      availableLimit: user.investmentLimit - user.totalInvested,
      kycProgress: calculateKycProgress(user.kycStatus),
      canInvest: user.kycStatus === 'verified'
    };

    const userProfile = {
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
      name: user.name,
      country: user.country,
      phone: user.phone,
      kycStatus: user.kycStatus,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin,
      investmentLimit: user.investmentLimit,
      totalInvested: user.totalInvested,
      preferredCurrency: user.preferredCurrency,
      notifications: user.notifications,
      portfolioStats: portfolioStats
    };

    res.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du profil'
    });
  }
});

/**
 * @route PUT /api/users/profile
 * @desc Mettre à jour le profil utilisateur
 * @access Private
 */
router.put('/profile', [
  authenticateUser,
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Nom invalide'),
  body('country').optional().isLength({ min: 2, max: 50 }).withMessage('Pays invalide'),
  body('phone').optional().matches(/^\+[1-9]\d{1,14}$/).withMessage('Numéro de téléphone invalide')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = req.user;
    const { email, name, country, phone, preferredCurrency, notifications } = req.body;

    // Mettre à jour les champs autorisés
    if (email) user.email = email;
    if (name) user.name = name;
    if (country) user.country = country;
    if (phone) user.phone = phone;
    if (preferredCurrency) user.preferredCurrency = preferredCurrency;
    if (notifications) user.notifications = { ...user.notifications, ...notifications };

    user.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
        phone: user.phone,
        preferredCurrency: user.preferredCurrency,
        notifications: user.notifications
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du profil'
    });
  }
});

/**
 * @route POST /api/users/kyc/submit
 * @desc Soumettre les documents KYC
 * @access Private
 */
router.post('/kyc/submit', [
  authenticateUser,
  body('documentType').isIn(['passport', 'id_card', 'driving_license']).withMessage('Type de document invalide'),
  body('documentNumber').isLength({ min: 5, max: 20 }).withMessage('Numéro de document invalide'),
  body('dateOfBirth').isISO8601().withMessage('Date de naissance invalide'),
  body('address').isLength({ min: 10, max: 200 }).withMessage('Adresse invalide')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = req.user;
    const { documentType, documentNumber, dateOfBirth, address, documents } = req.body;

    if (user.kycStatus === 'verified') {
      return res.status(400).json({
        success: false,
        error: 'KYC déjà vérifié'
      });
    }

    // Simuler la soumission KYC
    user.kycStatus = 'pending';
    user.kycSubmissionDate = new Date().toISOString();
    user.dateOfBirth = dateOfBirth;
    user.kycDocuments = {
      documentType,
      documentNumber,
      address,
      submissionDate: new Date().toISOString(),
      status: 'under_review'
    };

    // Augmenter la limite d'investissement pour les KYC en cours
    user.investmentLimit = 10000;

    res.json({
      success: true,
      message: 'Documents KYC soumis avec succès',
      data: {
        kycStatus: user.kycStatus,
        submissionDate: user.kycSubmissionDate,
        expectedProcessingTime: '3-5 jours ouvrables',
        newInvestmentLimit: user.investmentLimit
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la soumission KYC'
    });
  }
});

/**
 * @route GET /api/users/kyc/status
 * @desc Obtenir le statut KYC
 * @access Private
 */
router.get('/kyc/status', authenticateUser, (req, res) => {
  try {
    const user = req.user;

    const kycInfo = {
      status: user.kycStatus,
      submissionDate: user.kycSubmissionDate,
      verificationDate: user.kycVerificationDate,
      documents: user.kycDocuments || null,
      requirements: getKycRequirements(user.kycStatus),
      nextSteps: getKycNextSteps(user.kycStatus)
    };

    res.json({
      success: true,
      data: kycInfo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du statut KYC'
    });
  }
});

/**
 * @route GET /api/users/portfolio
 * @desc Obtenir le portfolio de l'utilisateur
 * @access Private
 */
router.get('/portfolio', authenticateUser, (req, res) => {
  try {
    const user = req.user;

    // Simuler les données de portfolio
    const portfolio = {
      totalValue: user.totalInvested,
      totalGain: 250.75,
      totalGainPercent: 3.13,
      investmentLimit: user.investmentLimit,
      availableLimit: user.investmentLimit - user.totalInvested,
      holdings: [
        {
          bondId: 1,
          bondSymbol: 'BF2027',
          bondName: 'Burkina Faso 2027',
          amount: 5000,
          purchasePrice: 990,
          currentPrice: 995,
          currentValue: 5025.25,
          gain: 25.25,
          gainPercent: 0.51,
          purchaseDate: '2025-07-20T14:30:00Z'
        },
        {
          bondId: 2,
          bondSymbol: 'CI2028',
          bondName: 'Côte d\'Ivoire 2028',
          amount: 3000,
          purchasePrice: 1010,
          currentPrice: 1015,
          currentValue: 3014.85,
          gain: 14.85,
          gainPercent: 0.49,
          purchaseDate: '2025-07-25T09:15:00Z'
        }
      ],
      recentActivity: [
        {
          type: 'purchase',
          bondSymbol: 'CI2028',
          amount: 3000,
          date: '2025-07-25T09:15:00Z'
        },
        {
          type: 'purchase',
          bondSymbol: 'BF2027',
          amount: 5000,
          date: '2025-07-20T14:30:00Z'
        }
      ]
    };

    res.json({
      success: true,
      data: portfolio
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du portfolio'
    });
  }
});

/**
 * @route PUT /api/users/notifications
 * @desc Mettre à jour les préférences de notification
 * @access Private
 */
router.put('/notifications', [
  authenticateUser,
  body('email').optional().isBoolean(),
  body('browser').optional().isBoolean(),
  body('investment').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = req.user;
    const { email, browser, investment } = req.body;

    user.notifications = {
      email: email !== undefined ? email : user.notifications.email,
      browser: browser !== undefined ? browser : user.notifications.browser,
      investment: investment !== undefined ? investment : user.notifications.investment
    };

    res.json({
      success: true,
      message: 'Préférences de notification mises à jour',
      data: user.notifications
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour des notifications'
    });
  }
});

// Fonctions utilitaires
function calculateKycProgress(kycStatus) {
  const statusMap = {
    'not_started': 0,
    'pending': 50,
    'under_review': 75,
    'verified': 100,
    'rejected': 0
  };
  return statusMap[kycStatus] || 0;
}

function getKycRequirements(kycStatus) {
  const requirements = {
    'not_started': [
      'Document d\'identité valide',
      'Justificatif de domicile',
      'Informations personnelles complètes'
    ],
    'pending': [
      'Documents en cours de vérification'
    ],
    'verified': [
      'KYC complet et vérifié'
    ],
    'rejected': [
      'Documents à resoummettre',
      'Vérifier les informations fournies'
    ]
  };
  return requirements[kycStatus] || [];
}

function getKycNextSteps(kycStatus) {
  const nextSteps = {
    'not_started': 'Commencer la vérification KYC',
    'pending': 'Attendre la vérification (3-5 jours)',
    'verified': 'Vous pouvez investir sans limite',
    'rejected': 'Resoummettre les documents corrigés'
  };
  return nextSteps[kycStatus] || '';
}

module.exports = router;
