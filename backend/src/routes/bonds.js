const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Données simulées pour le MVP (en production, ceci serait dans une base de données)
const bonds = [
  {
    id: 1,
    country: 'Burkina Faso',
    issuer: 'République du Burkina Faso',
    symbol: 'BF2027',
    name: 'Burkina Faso 2027 Bond',
    interestRate: 6.5,
    maturity: '2027-12-31',
    faceValue: 1000,
    currentPrice: 995,
    currency: 'USD',
    totalSupply: 10000000,
    availableSupply: 7500000,
    rating: 'B+',
    ratingAgency: 'Moody\'s',
    minimumInvestment: 100,
    contractAddress: '0x123...abc',
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-07-29T10:00:00Z',
    description: 'Obligation souveraine pour financer les infrastructures du Burkina Faso'
  },
  {
    id: 2,
    country: 'Côte d\'Ivoire',
    issuer: 'République de Côte d\'Ivoire',
    symbol: 'CI2028',
    name: 'Côte d\'Ivoire 2028 Bond',
    interestRate: 5.8,
    maturity: '2028-06-15',
    faceValue: 1000,
    currentPrice: 1015,
    currency: 'USD',
    totalSupply: 15000000,
    availableSupply: 12000000,
    rating: 'BB-',
    ratingAgency: 'S&P',
    minimumInvestment: 100,
    contractAddress: '0x456...def',
    isActive: true,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-07-29T10:00:00Z',
    description: 'Financement du développement économique de la Côte d\'Ivoire'
  },
  {
    id: 3,
    country: 'Sénégal',
    issuer: 'République du Sénégal',
    symbol: 'SN2029',
    name: 'Sénégal 2029 Bond',
    interestRate: 5.2,
    maturity: '2029-03-20',
    faceValue: 1000,
    currentPrice: 1030,
    currency: 'USD',
    totalSupply: 8000000,
    availableSupply: 5500000,
    rating: 'BB',
    ratingAgency: 'Fitch',
    minimumInvestment: 100,
    contractAddress: '0x789...ghi',
    isActive: true,
    createdAt: '2025-03-10T00:00:00Z',
    updatedAt: '2025-07-29T10:00:00Z',
    description: 'Obligations pour le Plan Sénégal Émergent 2035'
  }
];

// Transactions simulées
const transactions = [
  {
    id: 1,
    bondId: 1,
    userId: 'user1',
    type: 'BUY',
    amount: 5000,
    price: 990,
    timestamp: '2025-07-20T14:30:00Z',
    txHash: '0xabc...123'
  },
  {
    id: 2,
    bondId: 2,
    userId: 'user1',
    type: 'BUY',
    amount: 3000,
    price: 1010,
    timestamp: '2025-07-25T09:15:00Z',
    txHash: '0xdef...456'
  }
];

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
      daysToMaturity: calculateDaysToMaturity(bond.maturity)
    }));
    
    res.json({
      success: true,
      count: bondsWithMetrics.length,
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
      recentTransactions: getRecentTransactions(bondId)
    };
    
    res.json({
      success: true,
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
 * @desc Simuler un investissement dans une obligation
 * @access Public (en production, ceci nécessiterait une authentification)
 */
router.post('/:id/invest', [
  body('amount').isNumeric().withMessage('Le montant doit être numérique'),
  body('walletAddress').isLength({ min: 42, max: 42 }).withMessage('Adresse wallet invalide')
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
    const { amount, walletAddress } = req.body;
    
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
        error: `Montant minimum d'investissement: $${bond.minimumInvestment}`
      });
    }
    
    const tokensToReceive = amount / bond.currentPrice;
    if (tokensToReceive > bond.availableSupply) {
      return res.status(400).json({
        success: false,
        error: 'Supply insuffisante pour cet investissement'
      });
    }
    
    // Simuler la transaction
    const transaction = {
      id: transactions.length + 1,
      bondId: bondId,
      userId: walletAddress,
      type: 'BUY',
      amount: amount,
      price: bond.currentPrice,
      tokensReceived: tokensToReceive,
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
      status: 'PENDING'
    };
    
    transactions.push(transaction);
    
    // Mettre à jour la supply disponible
    bond.availableSupply -= tokensToReceive;
    bond.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Investissement simulé avec succès',
      data: {
        transaction,
        bond: {
          id: bond.id,
          symbol: bond.symbol,
          newAvailableSupply: bond.availableSupply
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
    const totalValue = bonds.reduce((sum, bond) => sum + (bond.totalSupply * bond.currentPrice), 0);
    const totalAvailable = bonds.reduce((sum, bond) => sum + (bond.availableSupply * bond.currentPrice), 0);
    const averageRate = bonds.reduce((sum, bond) => sum + bond.interestRate, 0) / bonds.length;
    
    const stats = {
      totalBonds: bonds.length,
      totalValue: totalValue,
      totalAvailable: totalAvailable,
      averageInterestRate: averageRate.toFixed(2),
      countries: [...new Set(bonds.map(bond => bond.country))],
      totalTransactions: transactions.length,
      activeInvestors: new Set(transactions.map(t => t.userId)).size
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
  return (annualInterest * daysSinceIssuance / 365).toFixed(2);
}

function generatePriceHistory(bond) {
  // Générer un historique de prix simulé
  const history = [];
  const basePrice = bond.currentPrice;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 20; // Variation de ±10
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(basePrice + variation, basePrice * 0.9)
    });
  }
  return history;
}

function getRecentTransactions(bondId) {
  return transactions
    .filter(t => t.bondId === bondId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
}

module.exports = router;
