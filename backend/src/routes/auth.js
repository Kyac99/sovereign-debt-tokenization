const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const router = express.Router();

// Base de données simulée pour les utilisateurs (en production, utiliser MongoDB)
const users = [
  {
    id: 'user1',
    email: 'jean.dupont@email.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/sQvQg7gXnF1FtqqAm', // password123
    name: 'Jean Dupont',
    country: 'France',
    phone: '+33123456789',
    kycStatus: 'verified',
    isEmailVerified: true,
    twoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    registrationDate: '2025-01-15T00:00:00Z',
    lastLogin: '2025-07-29T10:00:00Z',
    isActive: true,
    investmentLimit: 32500000, // 50,000 USD en XOF (1 USD = 650 XOF)
    totalInvested: 5200000, // 8,000 USD en XOF
    preferredCurrency: 'XOF'
  },
  {
    id: 'user2',
    email: 'marie.kouame@email.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/sQvQg7gXnF1FtqqAm', // password123
    name: 'Marie Kouame',
    country: 'Côte d\'Ivoire',
    phone: '+22501234567',
    kycStatus: 'pending',
    isEmailVerified: true,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    registrationDate: '2025-02-01T00:00:00Z',
    lastLogin: '2025-07-28T15:30:00Z',
    isActive: true,
    investmentLimit: 16250000, // 25,000 USD en XOF
    totalInvested: 0,
    preferredCurrency: 'XOF'
  }
];

// Codes de vérification temporaires (en production, utiliser Redis)
const verificationCodes = new Map();
const loginAttempts = new Map();

/**
 * @route POST /api/auth/register
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post('/register', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe minimum 8 caractères'),
  body('name').isLength({ min: 2, max: 50 }).withMessage('Nom invalide'),
  body('country').isLength({ min: 2 }).withMessage('Pays requis'),
  body('phone').optional().matches(/^\+[1-9]\d{1,14}$/).withMessage('Numéro de téléphone invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, name, country, phone } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Un compte avec cet email existe déjà'
      });
    }

    // Hash du mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer le nouvel utilisateur
    const newUser = {
      id: `user${users.length + 1}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name,
      country: country,
      phone: phone || null,
      kycStatus: 'not_started',
      isEmailVerified: false,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      registrationDate: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      investmentLimit: 650000, // 1,000 USD en XOF pour les nouveaux comptes
      totalInvested: 0,
      preferredCurrency: 'XOF'
    };

    users.push(newUser);

    // Générer un code de vérification email
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      type: 'email_verification'
    });

    // En production, envoyer l'email ici
    console.log(`Code de vérification pour ${email}: ${verificationCode}`);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès. Vérifiez votre email.',
      data: {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        country: newUser.country,
        emailVerificationRequired: true
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription'
    });
  }
});

/**
 * @route POST /api/auth/verify-email
 * @desc Vérifier l'email avec le code reçu
 * @access Public
 */
router.post('/verify-email', [
  body('email').isEmail().withMessage('Email invalide'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code de 6 chiffres requis')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, code } = req.body;
    const verification = verificationCodes.get(email.toLowerCase());

    if (!verification || verification.type !== 'email_verification') {
      return res.status(400).json({
        success: false,
        error: 'Code de vérification invalide ou expiré'
      });
    }

    if (Date.now() > verification.expires) {
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        error: 'Code de vérification expiré'
      });
    }

    if (verification.code !== code) {
      return res.status(400).json({
        success: false,
        error: 'Code de vérification incorrect'
      });
    }

    // Marquer l'email comme vérifié
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.isEmailVerified = true;
      user.investmentLimit = 3250000; // Augmenter à 5,000 USD en XOF après vérification email
    }

    verificationCodes.delete(email.toLowerCase());

    res.json({
      success: true,
      message: 'Email vérifié avec succès',
      data: {
        emailVerified: true,
        newInvestmentLimit: user.investmentLimit
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
 * @route POST /api/auth/login
 * @desc Connexion utilisateur
 * @access Public
 */
router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 1 }).withMessage('Mot de passe requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const userEmail = email.toLowerCase();

    // Vérifier les tentatives de connexion
    const attempts = loginAttempts.get(userEmail) || { count: 0, lastAttempt: 0 };
    if (attempts.count >= 5 && Date.now() - attempts.lastAttempt < 15 * 60 * 1000) {
      return res.status(429).json({
        success: false,
        error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
      });
    }

    const user = users.find(u => u.email === userEmail);
    if (!user) {
      // Incrémenter les tentatives même si l'utilisateur n'existe pas
      loginAttempts.set(userEmail, {
        count: attempts.count + 1,
        lastAttempt: Date.now()
      });
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Compte désactivé'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      loginAttempts.set(userEmail, {
        count: attempts.count + 1,
        lastAttempt: Date.now()
      });
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        error: 'Veuillez vérifier votre email avant de vous connecter',
        emailVerificationRequired: true
      });
    }

    // Réinitialiser les tentatives de connexion
    loginAttempts.delete(userEmail);

    // Vérifier si 2FA est activé
    if (user.twoFactorEnabled) {
      // Générer un token temporaire pour la 2FA
      const tempToken = jwt.sign(
        { userId: user.id, step: '2fa_required' },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '10m' }
      );

      return res.json({
        success: true,
        twoFactorRequired: true,
        tempToken: tempToken,
        message: 'Veuillez entrer votre code 2FA'
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date().toISOString();

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        kycStatus: user.kycStatus 
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          country: user.country,
          kycStatus: user.kycStatus,
          twoFactorEnabled: user.twoFactorEnabled,
          investmentLimit: user.investmentLimit,
          totalInvested: user.totalInvested,
          preferredCurrency: user.preferredCurrency
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
});

/**
 * @route POST /api/auth/setup-2fa
 * @desc Configurer l'authentification à deux facteurs
 * @access Private
 */
router.post('/setup-2fa', authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        error: '2FA déjà activée'
      });
    }

    // Générer un secret pour l'utilisateur
    const secret = speakeasy.generateSecret({
      name: `SovereignBonds (${user.email})`,
      issuer: 'SovereignBonds'
    });

    // Générer le QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Sauvegarder temporairement le secret (pas encore activé)
    user.tempTwoFactorSecret = secret.base32;

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        instructions: 'Scannez le QR code avec votre app d\'authentification (Google Authenticator, Authy, etc.) et entrez le code pour activer 2FA'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la configuration 2FA'
    });
  }
});

/**
 * @route POST /api/auth/verify-2fa-setup
 * @desc Vérifier et activer la 2FA
 * @access Private
 */
router.post('/verify-2fa-setup', [
  authenticateUser,
  body('token').isLength({ min: 6, max: 6 }).withMessage('Code 2FA de 6 chiffres requis')
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
    const { token } = req.body;

    if (!user.tempTwoFactorSecret) {
      return res.status(400).json({
        success: false,
        error: 'Aucune configuration 2FA en cours'
      });
    }

    // Vérifier le token 2FA
    const isValidToken = speakeasy.totp.verify({
      secret: user.tempTwoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        error: 'Code 2FA invalide'
      });
    }

    // Activer 2FA
    user.twoFactorEnabled = true;
    user.twoFactorSecret = user.tempTwoFactorSecret;
    delete user.tempTwoFactorSecret;

    // Augmenter la limite d'investissement
    user.investmentLimit = 32500000; // 50,000 USD en XOF pour les comptes 2FA

    res.json({
      success: true,
      message: '2FA activée avec succès',
      data: {
        twoFactorEnabled: true,
        newInvestmentLimit: user.investmentLimit
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'activation 2FA'
    });
  }
});

/**
 * @route POST /api/auth/verify-2fa
 * @desc Vérifier le code 2FA lors de la connexion
 * @access Public
 */
router.post('/verify-2fa', [
  body('tempToken').isLength({ min: 1 }).withMessage('Token temporaire requis'),
  body('token').isLength({ min: 6, max: 6 }).withMessage('Code 2FA de 6 chiffres requis')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { tempToken, token } = req.body;

    // Vérifier le token temporaire
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'dev-secret');
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Token temporaire invalide ou expiré'
      });
    }

    if (decoded.step !== '2fa_required') {
      return res.status(401).json({
        success: false,
        error: 'Token temporaire invalide'
      });
    }

    const user = users.find(u => u.id === decoded.userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur ou 2FA invalide'
      });
    }

    // Vérifier le code 2FA
    const isValidToken = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!isValidToken) {
      return res.status(401).json({
        success: false,
        error: 'Code 2FA invalide'
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date().toISOString();

    // Générer le token JWT final
    const finalToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        kycStatus: user.kycStatus 
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Connexion 2FA réussie',
      data: {
        token: finalToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          country: user.country,
          kycStatus: user.kycStatus,
          twoFactorEnabled: user.twoFactorEnabled,
          investmentLimit: user.investmentLimit,
          totalInvested: user.totalInvested,
          preferredCurrency: user.preferredCurrency
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification 2FA'
    });
  }
});

/**
 * @route POST /api/auth/forgot-password
 * @desc Demander une réinitialisation de mot de passe
 * @access Public
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Email invalide')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // Toujours retourner un succès pour éviter l'énumération d'emails
    if (user) {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      verificationCodes.set(email.toLowerCase(), {
        code: resetCode,
        expires: Date.now() + 30 * 60 * 1000, // 30 minutes
        type: 'password_reset'
      });

      // En production, envoyer l'email ici
      console.log(`Code de réinitialisation pour ${email}: ${resetCode}`);
    }

    res.json({
      success: true,
      message: 'Si votre email existe, vous recevrez un code de réinitialisation'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la demande de réinitialisation'
    });
  }
});

/**
 * @route POST /api/auth/reset-password
 * @desc Réinitialiser le mot de passe avec le code
 * @access Public
 */
router.post('/reset-password', [
  body('email').isEmail().withMessage('Email invalide'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code de 6 chiffres requis'),
  body('newPassword').isLength({ min: 8 }).withMessage('Mot de passe minimum 8 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, code, newPassword } = req.body;
    const userEmail = email.toLowerCase();
    const verification = verificationCodes.get(userEmail);

    if (!verification || verification.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        error: 'Code de réinitialisation invalide ou expiré'
      });
    }

    if (Date.now() > verification.expires) {
      verificationCodes.delete(userEmail);
      return res.status(400).json({
        success: false,
        error: 'Code de réinitialisation expiré'
      });
    }

    if (verification.code !== code) {
      return res.status(400).json({
        success: false,
        error: 'Code de réinitialisation incorrect'
      });
    }

    const user = users.find(u => u.email === userEmail);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;

    verificationCodes.delete(userEmail);

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la réinitialisation'
    });
  }
});

// Middleware d'authentification
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token d\'authentification requis'
    });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
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
}

module.exports = router;
