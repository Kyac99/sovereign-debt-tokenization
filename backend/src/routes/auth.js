const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Base de données simulée pour les utilisateurs
const users = [
  {
    id: 'user1',
    walletAddress: '0x1234567890123456789012345678901234567890',
    email: 'investor@example.com',
    name: 'Jean Dupont',
    country: 'France',
    kycStatus: 'verified',
    registrationDate: '2025-01-15T00:00:00Z',
    lastLogin: '2025-07-29T10:00:00Z',
    isActive: true,
    investmentLimit: 50000,
    totalInvested: 8000
  },
  {
    id: 'user2',
    walletAddress: '0x0987654321098765432109876543210987654321',
    email: 'diaspora@example.com',
    name: 'Marie Kouame',
    country: 'Côte d\'Ivoire',
    kycStatus: 'pending',
    registrationDate: '2025-02-01T00:00:00Z',
    lastLogin: '2025-07-28T15:30:00Z',
    isActive: true,
    investmentLimit: 25000,
    totalInvested: 0
  }
];

/**
 * @route POST /api/auth/connect
 * @desc Connecter un wallet et authentifier l'utilisateur
 * @access Public
 */
router.post('/connect', [
  body('walletAddress')
    .isLength({ min: 42, max: 42 })
    .withMessage('Adresse wallet invalide')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Format d\'adresse wallet invalide'),
  body('signature')
    .isLength({ min: 1 })
    .withMessage('Signature requise'),
  body('message')
    .isLength({ min: 1 })
    .withMessage('Message signé requis')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletAddress, signature, message } = req.body;

    // En production, on vérifierait la signature cryptographique ici
    // Pour le MVP, on simule une vérification réussie
    
    let user = users.find(u => u.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    
    if (!user) {
      // Créer un nouveau utilisateur
      user = {
        id: `user${users.length + 1}`,
        walletAddress: walletAddress,
        email: null,
        name: null,
        country: null,
        kycStatus: 'not_started',
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
        investmentLimit: 1000, // Limite faible pour les non-KYC
        totalInvested: 0
      };
      users.push(user);
    } else {
      // Mettre à jour la dernière connexion
      user.lastLogin = new Date().toISOString();
    }

    // Générer un token JWT simulé (en production, utiliser une vraie librairie JWT)
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      walletAddress: user.walletAddress,
      timestamp: Date.now()
    })).toString('base64');

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          name: user.name,
          country: user.country,
          kycStatus: user.kycStatus,
          investmentLimit: user.investmentLimit,
          totalInvested: user.totalInvested,
          canInvest: user.kycStatus === 'verified',
          isNewUser: !user.email
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
});

/**
 * @route POST /api/auth/verify-signature
 * @desc Vérifier une signature pour l'authentification
 * @access Public
 */
router.post('/verify-signature', [
  body('walletAddress').isLength({ min: 42, max: 42 }),
  body('signature').isLength({ min: 1 }),
  body('message').isLength({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletAddress, signature, message } = req.body;

    // Simulation de vérification de signature
    // En production, utiliser ethers.js ou web3.js pour vérifier
    const isValidSignature = signature.length > 130; // Vérification basique

    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        error: 'Signature invalide'
      });
    }

    res.json({
      success: true,
      message: 'Signature vérifiée',
      data: {
        isValid: true,
        walletAddress: walletAddress
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification'
    });
  }
});

/**
 * @route GET /api/auth/nonce
 * @desc Générer un nonce pour la signature
 * @access Public
 */
router.get('/nonce/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || walletAddress.length !== 42) {
      return res.status(400).json({
        success: false,
        error: 'Adresse wallet invalide'
      });
    }

    // Générer un nonce unique
    const nonce = Math.floor(Math.random() * 1000000);
    const timestamp = Date.now();
    
    const message = `Connexion à SovereignBonds\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    res.json({
      success: true,
      data: {
        message: message,
        nonce: nonce,
        timestamp: timestamp
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération du nonce'
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Déconnecter l'utilisateur
 * @access Private
 */
router.post('/logout', (req, res) => {
  try {
    // En production, on invaliderait le token JWT ici
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la déconnexion'
    });
  }
});

/**
 * @route GET /api/auth/check
 * @desc Vérifier si l'utilisateur est connecté
 * @access Private
 */
router.get('/check', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      // Décoder le token simulé
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const user = users.find(u => u.id === decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }

      res.json({
        success: true,
        data: {
          isAuthenticated: true,
          user: {
            id: user.id,
            walletAddress: user.walletAddress,
            kycStatus: user.kycStatus,
            canInvest: user.kycStatus === 'verified'
          }
        }
      });

    } catch (decodeError) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification'
    });
  }
});

module.exports = router;
