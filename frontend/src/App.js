import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Shield, Globe, ArrowRight, Plus, Minus, Eye, DollarSign } from 'lucide-react';

const SovereignBondsApp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedBond, setSelectedBond] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Données simulées pour le MVP
  const [bonds] = useState([
    {
      id: 1,
      country: 'Burkina Faso',
      issuer: 'République du Burkina Faso',
      symbol: 'BF2027',
      interestRate: 6.5,
      maturity: '2027-12-31',
      faceValue: 1000,
      currentPrice: 995,
      currency: 'USD',
      totalSupply: 10000000,
      availableSupply: 7500000,
      rating: 'B+',
      flag: '🇧🇫'
    },
    {
      id: 2,
      country: 'Côte d\'Ivoire',
      issuer: 'République de Côte d\'Ivoire',
      symbol: 'CI2028',
      interestRate: 5.8,
      maturity: '2028-06-15',
      faceValue: 1000,
      currentPrice: 1015,
      currency: 'USD',
      totalSupply: 15000000,
      availableSupply: 12000000,
      rating: 'BB-',
      flag: '🇨🇮'
    },
    {
      id: 3,
      country: 'Sénégal',
      issuer: 'République du Sénégal',
      symbol: 'SN2029',
      interestRate: 5.2,
      maturity: '2029-03-20',
      faceValue: 1000,
      currentPrice: 1030,
      currency: 'USD',
      totalSupply: 8000000,
      availableSupply: 5500000,
      rating: 'BB',
      flag: '🇸🇳'
    }
  ]);

  const [portfolio] = useState([
    { bondId: 1, amount: 5000, purchasePrice: 990 },
    { bondId: 2, amount: 3000, purchasePrice: 1010 }
  ]);

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } else {
        alert('Veuillez installer MetaMask pour continuer');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
    setLoading(false);
  };

  const calculateYield = (bond) => {
    const timeToMaturity = new Date(bond.maturity) - new Date();
    const yearsToMaturity = timeToMaturity / (1000 * 60 * 60 * 24 * 365);
    return ((bond.faceValue - bond.currentPrice) / bond.currentPrice / yearsToMaturity * 100).toFixed(2);
  };

  const calculatePortfolioValue = () => {
    return portfolio.reduce((total, holding) => {
      const bond = bonds.find(b => b.id === holding.bondId);
      return total + (holding.amount * bond.currentPrice / bond.faceValue);
    }, 0);
  };

  const Header = () => (
    <header className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Globe className="h-8 w-8" />
          <h1 className="text-2xl font-bold">SovereignBonds</h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-blue-200 transition-colors">Accueil</a>
          <a href="#" className="hover:text-blue-200 transition-colors">Obligations</a>
          <a href="#" className="hover:text-blue-200 transition-colors">Portfolio</a>
          <a href="#" className="hover:text-blue-200 transition-colors">À propos</a>
        </nav>
        <button
          onClick={connectWallet}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            isConnected 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Wallet className="h-4 w-4" />
          <span>
            {loading ? 'Connexion...' : 
             isConnected ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
             'Connecter Wallet'}
          </span>
        </button>
      </div>
    </header>
  );

  const HeroSection = () => (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Investissez dans l'avenir
          <span className="block text-blue-600">de l'Afrique</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Plateforme de tokenisation des dettes souveraines permettant à la diaspora 
          d'investir facilement dans les obligations d'États africains via la blockchain
        </p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Sécurisé</span>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Rentable</span>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
            <Globe className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">Accessible</span>
          </div>
        </div>
      </div>
    </section>
  );

  const BondCard = ({ bond }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{bond.flag}</span>
          <div>
            <h3 className="font-bold text-lg">{bond.country}</h3>
            <p className="text-gray-600 text-sm">{bond.symbol}</p>
          </div>
        </div>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
          {bond.rating}
        </span>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Taux d'intérêt</span>
          <span className="font-semibold text-green-600">{bond.interestRate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Échéance</span>
          <span className="font-semibold">{new Date(bond.maturity).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Prix actuel</span>
          <span className="font-semibold">${bond.currentPrice}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Rendement</span>
          <span className="font-semibold text-blue-600">{calculateYield(bond)}%</span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Disponible</span>
          <span>{((bond.availableSupply / bond.totalSupply) * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${(bond.availableSupply / bond.totalSupply) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <button
        onClick={() => setSelectedBond(bond)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
      >
        <span>Investir</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );

  const InvestmentModal = () => {
    if (!selectedBond) return null;

    const handleInvest = () => {
      if (!isConnected) {
        alert('Veuillez connecter votre wallet d\'abord');
        return;
      }
      alert(`Investissement de $${investmentAmount} dans ${selectedBond.symbol} simulé avec succès!`);
      setSelectedBond(null);
      setInvestmentAmount('');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Investir dans {selectedBond.symbol}</h3>
            <button
              onClick={() => setSelectedBond(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{selectedBond.flag}</span>
              <div>
                <p className="font-semibold">{selectedBond.country}</p>
                <p className="text-gray-600 text-sm">{selectedBond.issuer}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Prix unitaire</span>
                <span className="font-semibold">${selectedBond.currentPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Taux d'intérêt</span>
                <span className="font-semibold text-green-600">{selectedBond.interestRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Échéance</span>
                <span className="font-semibold">{new Date(selectedBond.maturity).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Montant d'investissement (USD)</label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="Montant minimum: $100"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {investmentAmount && (
                <p className="text-sm text-gray-600 mt-1">
                  Tokens à recevoir: {(parseFloat(investmentAmount) / selectedBond.currentPrice).toFixed(2)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedBond(null)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleInvest}
              disabled={!investmentAmount || parseFloat(investmentAmount) < 100}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Portfolio = () => (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Votre Portfolio</h2>
        {isConnected ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Valeur totale du portfolio</p>
                <p className="text-4xl font-bold text-blue-600">
                  ${calculatePortfolioValue().toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="grid gap-6">
              {portfolio.map((holding, index) => {
                const bond = bonds.find(b => b.id === holding.bondId);
                const currentValue = holding.amount * bond.currentPrice / bond.faceValue;
                const gain = currentValue - holding.amount;
                const gainPercent = (gain / holding.amount * 100);
                
                return (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{bond.flag}</span>
                        <div>
                          <h3 className="font-bold">{bond.symbol}</h3>
                          <p className="text-gray-600">{bond.country}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${currentValue.toFixed(2)}</p>
                        <p className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Connectez votre wallet pour voir votre portfolio</p>
            <button
              onClick={connectWallet}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connecter Wallet
            </button>
          </div>
        )}
      </div>
    </section>
  );

  const BondsSection = () => (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Obligations Disponibles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les opportunités d'investissement dans les obligations souveraines africaines
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {bonds.map(bond => (
            <BondCard key={bond.id} bond={bond} />
          ))}
        </div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-6 text-center">
        <div className="flex justify-center items-center space-x-3 mb-4">
          <Globe className="h-6 w-6" />
          <span className="text-xl font-bold">SovereignBonds</span>
        </div>
        <p className="text-gray-400">
          Démocratiser l'accès aux investissements souverains pour la diaspora africaine
        </p>
        <div className="mt-4 text-sm text-gray-500">
          © 2025 SovereignBonds. MVP - Version de démonstration.
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <BondsSection />
      <Portfolio />
      <Footer />
      <InvestmentModal />
    </div>
  );
};

export default SovereignBondsApp;
