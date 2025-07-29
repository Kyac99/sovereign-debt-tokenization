const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Données simulées pour le MVP avec prix en XOF (1 USD = 650 XOF)
const bonds = [
  {
    id: 1,
    country: 'Burkina Faso',
    issuer: 'République du Burkina Faso',
    symbol: 'BF2027',
    name: 'Burkina Faso 2027 Bond',
    interestRate: 6.5,
    maturity: '2027-12-31',
    faceValue: 650000, // 1000 USD en XOF
    currentPrice: 646750, // 995 USD en XOF
    currency: 'XOF',
    totalSupply: 6500000000, // 10M USD en XOF
    availableSupply: 4875000000, // 7.5M USD en XOF
    rating: 'B+',
    ratingAgency: 'Moody\'s',
    minimumInvestment: 65000, // 100 USD en XOF
    contractAddress: '0x123...abc',
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-07-29T10:00:00Z',
    description: 'Obligation souveraine pour financer les infrastructures du Burkina Faso',
    flag: '🇧🇫'
  },
  {
    id: 2,
    country: 'Côte d\'Ivoire',
    issuer: 'République de Côte d\'Ivoire',
    symbol: 'CI2028',
    name: 'Côte d\'Ivoire 2028 Bond',
    interestRate: 5.8,
    maturity: '2028-06-15',
    faceValue: 650000, // 1000 USD en XOF
    currentPrice: 659750, // 1015 USD en XOF
    currency: 'XOF',
    totalSupply: 9750000000, // 15M USD en XOF
    availableSupply: 7800000000, // 12M USD en XOF
    rating: 'BB-',
    ratingAgency: 'S&P',
    minimumInvestment: 65000, // 100 USD en XOF
    contractAddress: '0x456...def',
    isActive: true,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-07-29T10:00:00Z',
    description: 'Financement du développement économique de la Côte d\'Ivoire',
    flag: '🇨🇮'
  },
  {
    id: 3,
    country: 'Sénégal',
    issuer: 'République du Sénégal',
    symbol: 'SN2029',
    name: 'Sénégal 2029 Bond',
    interestRate: 5.2,
    maturity: '2029-03-20',
    faceValue: 650000, // 1000 USD en XOF
    currentPrice: 669500, // 1030 USD en XOF
    currency: 'XOF',
    totalSupply: 5200000000, // 8M USD en XOF
    availableSupply: 3575000000, // 5.5M USD en XOF
    rating: 'BB',
    ratingAgency: 'Fitch',
    minimumInvestment: 65000, // 100 USD en XOF
    contractAddress: '0x789...ghi',
    isActive: true,
    createdAt: '2025-03-10T00:00:00Z',
    updatedAt: '2025-07-29T10:00:00Z',
    description: 'Obligations pour le Plan Sénégal Émergent 2035',
    flag: '🇸🇳'
  }
];

// Transactions simulées avec montants en XOF
const transactions = [
  {
    id: 1,
    userId: 'user1',
    bondId: 1,
    bondSymbol: 'BF2027',
    type: 'BUY',
    amount: 3250000, // 5000 USD en XOF
    tokens: 5.025,
    price: 646750,
    totalCost: 3250000,
    fees: 16250, // 0.5% en XOF
    status: 'completed',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    blockNumber: 18500000,
    timestamp: '2025-07-20T14:30:00Z',
    updatedAt: '2025-07-20T14:32:15Z'
  },
  {
    id: 2,
    userId: 'user1',
    bondId: 2,
    bondSymbol: 'CI2028',
    type: 'BUY',
    amount: 1950000, // 3000 USD en XOF
    tokens: 2.956,
    price: 659750,
    totalCost: 1950000,
    fees: 9750, // 0.5% en XOF
    status: 'completed',
    txHash: '0x123456789abcdef0123456789abcdef0123456789',
    blockNumber: 18550000,
    timestamp: '2025-07-25T09:15:00Z',
    updatedAt: '2025-07-25T09:17:22Z'
  }
];

// Middleware d'authentification
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token d\'authentification requis'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
};

/**
 * @route GET /api/bonds
 * @desc Obtenir toutes les obligations disponibles
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    const { country, active = 'true' } = req.query;
    
    let filteredBonds = bonds;
    
    // Filtrer par pays si spécifié
    if (country) {
      filteredBonds = filteredBonds.filter(bond => 
        bond.country.toLowerCase().includes(country.toLowerCase())
      );
    }
    
    // Filtrer par statut actif
    if (active === 'true') {
      filteredBonds = filteredBonds.filter(bond => bond.isActive);
    }
    
    // Calculer des métriques supplémentaires
    const bondsWithMetrics = filteredBonds.map(bond => ({
      ...bond,
      availabilityPercentage: ((bond.availableSupply / bond.totalSupply) * 100).toFixed(1),
      yieldToMaturity: calculateYieldToMaturity(bond),
      daysToMaturity: calculateDaysToMaturity(bond.maturity),
      // Formatage des montants pour l'affichage
      formattedPrice: formatXOF(bond.currentPrice),
      formattedFaceValue: formatXOF(bond.faceValue),
      formattedMinInvestment: formatXOF(bond.minimumInvestment)
    }));
    
    res.json({
      success: true,
      count: bondsWithMetrics.length,
      currency: 'XOF',
      exchangeRate: '1 USD = 650 XOF',
      data: bondsWithMetrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des obligations'
    });
  }
});

/**
 * @route GET /api/bonds/:id
 * @desc Obtenir une obligation spécifique
 * @access Public
 */
router.get('/:id', (req, res) => {
  try {
    const bondId = parseInt(req.params.id);
    const bond = bonds.find(b => b.id === bondId);
    
    if (!bond) {
      return res.status(404).json({
        success: false,
        error: 'Obligation non trouvée'
      });
    }
    
    // Ajouter des métriques détaillées
    const bondWithDetails = {
      ...bond,
      availabilityPercentage: ((bond.availableSupply / bond.totalSupply) * 100).toFixed(1),
      yieldToMaturity: calculateYieldToMaturity(bond),
      daysToMaturity: calculateDaysToMaturity(bond.maturity),
      accruedInterest: calculateAccruedInterest(bond),
      priceHistory: generatePriceHistory(bond), // Données simulées
      recentTransactions: getRecentTransactions(bondId),
      // Formatage des montants
      formattedPrice: formatXOF(bond.currentPrice),
      formattedFaceValue: formatXOF(bond.faceValue),
      formattedMinInvestment: formatXOF(bond.minimumInvestment),
      formattedTotalSupply: formatXOF(bond.totalSupply),
      formattedAvailableSupply: formatXOF(bond.availableSupply)
    };
    
    res.json({
      success: true,
      currency: 'XOF',
      data: bondWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'obligation'
    });
  }
});

/**
 * @route POST /api/bonds/:id/invest
 * @desc Investir dans une obligation
 * @access Private
 */
router.post('/:id/invest', [
  authenticateUser,
  body('amount').isNumeric().withMessage('Le montant doit être numérique'),
  body('amount').custom(value => {
    if (value < 65000) { // 100 USD en XOF
      throw new Error('Montant minimum: 65,000 XOF');
    }
    return true;
  })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const bondId = parseInt(req.params.id);
    const { amount } = req.body;
    
    const bond = bonds.find(b => b.id === bondId);
    if (!bond) {
      return res.status(404).json({
        success: false,
        error: 'Obligation non trouvée'
      });
    }
    
    // Vérifications
    if (amount < bond.minimumInvestment) {
      return res.status(400).json({
        success: false,
        error: `Montant minimum d'investissement: ${formatXOF(bond.minimumInvestment)}`
      });
    }
    
    const tokensToReceive = amount / bond.currentPrice;
    if (tokensToReceive * bond.currentPrice > bond.availableSupply) {
      return res.status(400).json({
        success: false,
        error: 'Supply insuffisante pour cet investissement'
      });
    }
    
    // Calculer les frais (0.5%)
    const fees = Math.round(amount * 0.005);
    const totalCost = amount + fees;
    
    // Simuler la transaction
    const transaction = {
      id: transactions.length + 1,
      userId: req.userId,
      userEmail: req.userEmail,
      bondId: bondId,
      bondSymbol: bond.symbol,
      type: 'BUY',
      amount: amount,
      tokensReceived: tokensToReceive,
      price: bond.currentPrice,
      totalCost: totalCost,
      fees: fees,
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
      status: 'PENDING'
    };
    
    transactions.push(transaction);
    
    // Mettre à jour la supply disponible
    bond.availableSupply -= (tokensToReceive * bond.currentPrice);
    bond.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Investissement traité avec succès',
      data: {
        transaction: {
          ...transaction,
          formattedAmount: formatXOF(transaction.amount),
          formattedTotalCost: formatXOF(transaction.totalCost),
          formattedFees: formatXOF(transaction.fees)
        },
        bond: {
          id: bond.id,
          symbol: bond.symbol,
          newAvailableSupply: bond.availableSupply,
          formattedNewAvailableSupply: formatXOF(bond.availableSupply)
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'investissement'
    });
  }
});

/**
 * @route GET /api/bonds/stats/overview
 * @desc Obtenir des statistiques générales
 * @access Public
 */
router.get('/stats/overview', (req, res) => {
  try {
    const totalValue = bonds.reduce((sum, bond) => sum + (bond.totalSupply), 0);
    const totalAvailable = bonds.reduce((sum, bond) => sum + bond.availableSupply, 0);
    const averageRate = bonds.reduce((sum, bond) => sum + bond.interestRate, 0) / bonds.length;
    
    const stats = {
      totalBonds: bonds.length,
      totalValue: totalValue,
      totalAvailable: totalAvailable,
      averageInterestRate: averageRate.toFixed(2),
      countries: [...new Set(bonds.map(bond => bond.country))],
      totalTransactions: transactions.length,
      activeInvestors: new Set(transactions.map(t => t.userId)).size,
      currency: 'XOF',
      // Montants formatés
      formattedTotalValue: formatXOF(totalValue),
      formattedTotalAvailable: formatXOF(totalAvailable),
      exchangeRate: '1 USD = 650 XOF'
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

/**
 * @route GET /api/bonds/currencies/rates
 * @desc Obtenir les taux de change actuels
 * @access Public
 */
router.get('/currencies/rates', (req, res) => {
  try {
    const exchangeRates = {
      base: 'XOF',
      rates: {
        USD: 0.00154, // 1 XOF = 0.00154 USD
        EUR: 0.00142, // 1 XOF = 0.00142 EUR
        GBP: 0.00122, // 1 XOF = 0.00122 GBP
        CAD: 0.00208  // 1 XOF = 0.00208 CAD
      },
      reverseRates: {
        USD: 650,  // 1 USD = 650 XOF
        EUR: 704,  // 1 EUR = 704 XOF
        GBP: 820,  // 1 GBP = 820 XOF
        CAD: 481   // 1 CAD = 481 XOF
      },
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: exchangeRates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des taux de change'
    });
  }
});

// Fonctions utilitaires
function calculateYieldToMaturity(bond) {
  const timeToMaturity = new Date(bond.maturity) - new Date();
  const yearsToMaturity = timeToMaturity / (1000 * 60 * 60 * 24 * 365);
  return ((bond.faceValue - bond.currentPrice) / bond.currentPrice / yearsToMaturity * 100).toFixed(2);
}

function calculateDaysToMaturity(maturityDate) {
  const timeToMaturity = new Date(maturityDate) - new Date();
  return Math.floor(timeToMaturity / (1000 * 60 * 60 * 24));
}

function calculateAccruedInterest(bond) {
  const daysSinceIssuance = (new Date() - new Date(bond.createdAt)) / (1000 * 60 * 60 * 24);
  const annualInterest = bond.faceValue * (bond.interestRate / 100);
  return Math.round(annualInterest * daysSinceIssuance / 365);
}

function generatePriceHistory(bond) {
  // Générer un historique de prix simulé
  const history = [];
  const basePrice = bond.currentPrice;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 13000; // Variation de ±10,000 XOF
    const price = Math.max(basePrice + variation, basePrice * 0.9);
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price),
      formattedPrice: formatXOF(Math.round(price))
    });
  }
  return history;
}

function getRecentTransactions(bondId) {
  return transactions
    .filter(t => t.bondId === bondId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
    .map(t => ({
      ...t,
      formattedAmount: formatXOF(t.amount),
      formattedTotalCost: formatXOF(t.totalCost)
    }));
}

function formatXOF(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

module.exports = router;
