const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Base de données simulée pour les transactions
const transactions = [
  {
    id: 1,
    userId: 'user1',
    bondId: 1,
    bondSymbol: 'BF2027',
    type: 'BUY',
    amount: 5000,
    tokens: 5.025,
    price: 990,
    totalCost: 4950,
    fees: 24.75,
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
    amount: 3000,
    tokens: 2.956,
    price: 1010,
    totalCost: 3030,
    fees: 15.15,
    status: 'completed',
    txHash: '0x123456789abcdef0123456789abcdef0123456789',
    blockNumber: 18550000,
    timestamp: '2025-07-25T09:15:00Z',
    updatedAt: '2025-07-25T09:17:22Z'
  },
  {
    id: 3,
    userId: 'user2',
    bondId: 1,
    bondSymbol: 'BF2027',
    type: 'BUY',
    amount: 1000,
    tokens: 1.005,
    price: 990,
    totalCost: 990,
    fees: 4.95,
    status: 'pending',
    txHash: '0x987654321fedcba0987654321fedcba0987654321',
    blockNumber: null,
    timestamp: '2025-07-29T16:45:00Z',
    updatedAt: '2025-07-29T16:45:00Z'
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
    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
};

/**
 * @route GET /api/transactions
 * @desc Obtenir les transactions de l'utilisateur connecté
 * @access Private
 */
router.get('/', authenticateUser, (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, bondId } = req.query;
    const userId = req.userId;

    let userTransactions = transactions.filter(t => t.userId === userId);

    // Filtres
    if (type) {
      userTransactions = userTransactions.filter(t => t.type.toLowerCase() === type.toLowerCase());
    }
    if (status) {
      userTransactions = userTransactions.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }
    if (bondId) {
      userTransactions = userTransactions.filter(t => t.bondId === parseInt(bondId));
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = userTransactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(startIndex, endIndex);

    // Calculer les statistiques
    const stats = {
      total: userTransactions.length,
      totalInvested: userTransactions
        .filter(t => t.type === 'BUY' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      totalFees: userTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.fees, 0),
      averageInvestment: userTransactions.length > 0 
        ? userTransactions.reduce((sum, t) => sum + t.amount, 0) / userTransactions.length 
        : 0
    };

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(userTransactions.length / limit),
          totalItems: userTransactions.length,
          hasNext: endIndex < userTransactions.length,
          hasPrev: page > 1
        },
        stats: stats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des transactions'
    });
  }
});

/**
 * @route GET /api/transactions/:id
 * @desc Obtenir une transaction spécifique
 * @access Private
 */
router.get('/:id', authenticateUser, (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.userId;

    const transaction = transactions.find(t => 
      t.id === transactionId && t.userId === userId
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction non trouvée'
      });
    }

    // Ajouter des détails supplémentaires
    const transactionDetails = {
      ...transaction,
      confirmations: transaction.blockNumber ? 25 : 0,
      estimatedGasUsed: '21000',
      network: 'Polygon',
      explorerUrl: `https://polygonscan.com/tx/${transaction.txHash}`,
      receiptGenerated: transaction.status === 'completed'
    };

    res.json({
      success: true,
      data: transactionDetails
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la transaction'
    });
  }
});

/**
 * @route POST /api/transactions/simulate
 * @desc Simuler une transaction d'investissement
 * @access Private
 */
router.post('/simulate', [
  authenticateUser,
  body('bondId').isInt({ min: 1 }).withMessage('ID d\'obligation invalide'),
  body('amount').isFloat({ min: 100 }).withMessage('Montant minimum: $100'),
  body('type').isIn(['BUY', 'SELL']).withMessage('Type de transaction invalide')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bondId, amount, type } = req.body;
    const userId = req.userId;

    // Simuler les données de l'obligation (en production, récupérer depuis la DB/blockchain)
    const bonds = {
      1: { symbol: 'BF2027', currentPrice: 995, minimumInvestment: 100 },
      2: { symbol: 'CI2028', currentPrice: 1015, minimumInvestment: 100 },
      3: { symbol: 'SN2029', currentPrice: 1030, minimumInvestment: 100 }
    };

    const bond = bonds[bondId];
    if (!bond) {
      return res.status(404).json({
        success: false,
        error: 'Obligation non trouvée'
      });
    }

    if (amount < bond.minimumInvestment) {
      return res.status(400).json({
        success: false,
        error: `Montant minimum: $${bond.minimumInvestment}`
      });
    }

    // Calculer les frais et tokens
    const feeRate = 0.005; // 0.5%
    const fees = amount * feeRate;
    const tokens = type === 'BUY' ? amount / bond.currentPrice : amount;
    const totalCost = type === 'BUY' ? amount + fees : amount - fees;

    const simulation = {
      bondId: bondId,
      bondSymbol: bond.symbol,
      type: type,
      amount: amount,
      price: bond.currentPrice,
      tokens: tokens,
      fees: fees,
      totalCost: totalCost,
      estimatedGas: '21000',
      estimatedGasCost: '0.001',
      slippage: '0.1%',
      priceImpact: '< 0.01%'
    };

    res.json({
      success: true,
      data: simulation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la simulation'
    });
  }
});

/**
 * @route POST /api/transactions/create
 * @desc Créer une nouvelle transaction
 * @access Private
 */
router.post('/create', [
  authenticateUser,
  body('bondId').isInt({ min: 1 }).withMessage('ID d\'obligation invalide'),
  body('amount').isFloat({ min: 100 }).withMessage('Montant minimum: $100'),
  body('type').isIn(['BUY', 'SELL']).withMessage('Type de transaction invalide'),
  body('txHash').isLength({ min: 66, max: 66 }).withMessage('Hash de transaction invalide')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bondId, amount, type, txHash } = req.body;
    const userId = req.userId;

    // Vérifier si la transaction existe déjà
    const existingTx = transactions.find(t => t.txHash === txHash);
    if (existingTx) {
      return res.status(400).json({
        success: false,
        error: 'Transaction déjà enregistrée'
      });
    }

    // Simuler les données de l'obligation
    const bonds = {
      1: { symbol: 'BF2027', currentPrice: 995 },
      2: { symbol: 'CI2028', currentPrice: 1015 },
      3: { symbol: 'SN2029', currentPrice: 1030 }
    };

    const bond = bonds[bondId];
    const feeRate = 0.005;
    const fees = amount * feeRate;
    const tokens = amount / bond.currentPrice;

    const newTransaction = {
      id: transactions.length + 1,
      userId: userId,
      bondId: bondId,
      bondSymbol: bond.symbol,
      type: type,
      amount: amount,
      tokens: tokens,
      price: bond.currentPrice,
      totalCost: amount + fees,
      fees: fees,
      status: 'pending',
      txHash: txHash,
      blockNumber: null,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    transactions.push(newTransaction);

    // Simuler la confirmation après quelques secondes
    setTimeout(() => {
      const tx = transactions.find(t => t.id === newTransaction.id);
      if (tx) {
        tx.status = 'completed';
        tx.blockNumber = 18600000 + Math.floor(Math.random() * 1000);
        tx.updatedAt = new Date().toISOString();
      }
    }, 5000);

    res.json({
      success: true,
      message: 'Transaction créée avec succès',
      data: newTransaction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la transaction'
    });
  }
});

/**
 * @route GET /api/transactions/stats/summary
 * @desc Obtenir un résumé des statistiques de transaction
 * @access Private
 */
router.get('/stats/summary', authenticateUser, (req, res) => {
  try {
    const userId = req.userId;
    const userTransactions = transactions.filter(t => t.userId === userId);

    const completedTransactions = userTransactions.filter(t => t.status === 'completed');
    const pendingTransactions = userTransactions.filter(t => t.status === 'pending');

    const summary = {
      totalTransactions: userTransactions.length,
      completedTransactions: completedTransactions.length,
      pendingTransactions: pendingTransactions.length,
      totalInvested: completedTransactions
        .filter(t => t.type === 'BUY')
        .reduce((sum, t) => sum + t.amount, 0),
      totalFees: completedTransactions.reduce((sum, t) => sum + t.fees, 0),
      averageTransactionSize: userTransactions.length > 0 
        ? userTransactions.reduce((sum, t) => sum + t.amount, 0) / userTransactions.length 
        : 0,
      mostRecentTransaction: userTransactions.length > 0 
        ? userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
        : null,
      transactionsByMonth: getTransactionsByMonth(userTransactions),
      bondDistribution: getBondDistribution(completedTransactions)
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

/**
 * @route PUT /api/transactions/:id/cancel
 * @desc Annuler une transaction en attente
 * @access Private
 */
router.put('/:id/cancel', authenticateUser, (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.userId;

    const transaction = transactions.find(t => 
      t.id === transactionId && t.userId === userId
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction non trouvée'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Seules les transactions en attente peuvent être annulées'
      });
    }

    transaction.status = 'cancelled';
    transaction.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Transaction annulée avec succès',
      data: transaction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'annulation'
    });
  }
});

// Fonctions utilitaires
function getTransactionsByMonth(transactions) {
  const monthlyData = {};
  
  transactions.forEach(tx => {
    const month = new Date(tx.timestamp).toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { count: 0, amount: 0 };
    }
    monthlyData[month].count++;
    monthlyData[month].amount += tx.amount;
  });

  return Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function getBondDistribution(transactions) {
  const distribution = {};
  
  transactions.forEach(tx => {
    if (!distribution[tx.bondSymbol]) {
      distribution[tx.bondSymbol] = { count: 0, amount: 0 };
    }
    distribution[tx.bondSymbol].count++;
    distribution[tx.bondSymbol].amount += tx.amount;
  });

  return Object.entries(distribution)
    .map(([symbol, data]) => ({ symbol, ...data }))
    .sort((a, b) => b.amount - a.amount);
}

module.exports = router;
