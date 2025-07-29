import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Globe, ArrowRight, Eye, EyeOff, Mail, Lock, Smartphone, AlertCircle, CheckCircle, X, User, Phone, MapPin, DollarSign } from 'lucide-react';

const SovereignBondsApp = () => {
  const [currentView, setCurrentView] = useState('login'); // login, register, verify-email, setup-2fa, dashboard
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedBond, setSelectedBond] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // États pour l'authentification
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    country: '',
    phone: '',
    verificationCode: '',
    twoFactorCode: ''
  });

  // Données simulées pour les obligations en XOF
  const [bonds] = useState([
    {
      id: 1,
      country: 'Burkina Faso',
      issuer: 'République du Burkina Faso',
      symbol: 'BF2027',
      interestRate: 6.5,
      maturity: '2027-12-31',
      faceValue: 650000,
      currentPrice: 646750,
      currency: 'XOF',
      totalSupply: 6500000000,
      availableSupply: 4875000000,
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
      faceValue: 650000,
      currentPrice: 659750,
      currency: 'XOF',
      totalSupply: 9750000000,
      availableSupply: 7800000000,
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
      faceValue: 650000,
      currentPrice: 669500,
      currency: 'XOF',
      totalSupply: 5200000000,
      availableSupply: 3575000000,
      rating: 'BB',
      flag: '🇸🇳'
    }
  ]);

  const [portfolio] = useState([
    { bondId: 1, amount: 3250000, purchasePrice: 646750 },
    { bondId: 2, amount: 1950000, purchasePrice: 659750 }
  ]);

  // Utilitaires
  const formatXOF = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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

  // Gestion des formulaires
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulation API call
      if (formData.email === 'jean.dupont@email.com' && formData.password === 'password123') {
        const mockUser = {
          id: 'user1',
          email: 'jean.dupont@email.com',
          name: 'Jean Dupont',
          country: 'France',
          kycStatus: 'verified',
          twoFactorEnabled: true,
          investmentLimit: 32500000
        };

        if (mockUser.twoFactorEnabled) {
          setUser(mockUser);
          setCurrentView('verify-2fa');
        } else {
          setUser(mockUser);
          setIsAuthenticated(true);
          setCurrentView('dashboard');
        }
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Erreur de connexion');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      // Simulation API call
      setSuccess('Compte créé ! Vérifiez votre email.');
      setCurrentView('verify-email');
    } catch (error) {
      setError('Erreur lors de l\'inscription');
    }
    setLoading(false);
  };

  const handleEmailVerification = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulation API call
      if (formData.verificationCode === '123456') {
        setSuccess('Email vérifié ! Configuration de la 2FA recommandée.');
        setCurrentView('setup-2fa');
      } else {
        setError('Code de vérification incorrect');
      }
    } catch (error) {
      setError('Erreur de vérification');
    }
    setLoading(false);
  };

  const handle2FAVerification = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulation API call
      if (formData.twoFactorCode === '123456') {
        setIsAuthenticated(true);
        setCurrentView('dashboard');
        setSuccess('Connexion réussie !');
      } else {
        setError('Code 2FA incorrect');
      }
    } catch (error) {
      setError('Erreur de vérification 2FA');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('login');
    setFormData({});
  };

  // Composants UI
  const AlertMessage = ({ type, message, onClose }) => (
    <div className={`p-4 rounded-lg flex items-center space-x-2 mb-4 ${
      type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
      'bg-green-50 text-green-700 border border-green-200'
    }`}>
      {type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-auto">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const InputField = ({ label, type, name, value, onChange, placeholder, required, icon: Icon }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />}
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );

  // Pages d'authentification
  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">SovereignBonds</h1>
          </div>
          <p className="text-gray-600">Investissez dans l'avenir de l'Afrique</p>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="space-y-6">
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="votre@email.com"
            required
            icon={Mail}
          />

          <InputField
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
            icon={Lock}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center space-y-4">
          <button
            onClick={() => setCurrentView('register')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Créer un compte
          </button>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Compte de test :</p>
            <p className="text-sm text-blue-600">Email: jean.dupont@email.com</p>
            <p className="text-sm text-blue-600">Mot de passe: password123</p>
          </div>
        </div>
      </div>
    </div>
  );

  const RegisterPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Créer un compte</h2>
          <p className="text-gray-600">Rejoignez la révolution financière</p>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

        <div className="space-y-4">
          <InputField
            label="Nom complet"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Votre nom"
            required
            icon={User}
          />

          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="votre@email.com"
            required
            icon={Mail}
          />

          <InputField
            label="Pays de résidence"
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="France"
            required
            icon={MapPin}
          />

          <InputField
            label="Téléphone (optionnel)"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+33 1 23 45 67 89"
            icon={Phone}
          />

          <InputField
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Minimum 8 caractères"
            required
            icon={Lock}
          />

          <InputField
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
            icon={Lock}
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Création...' : 'Créer le compte'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentView('login')}
            className="text-blue-600 hover:text-blue-700"
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </div>
  );

  const EmailVerificationPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Vérifiez votre email</h2>
          <p className="text-gray-600">Nous avons envoyé un code à {formData.email}</p>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
            <input
              type="text"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleInputChange}
              placeholder="123456"
              maxLength="6"
              required
              className="w-full text-center text-2xl tracking-widest px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleEmailVerification}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Vérification...' : 'Vérifier l\'email'}
          </button>
        </div>

        <div className="mt-6 text-center bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Code de test : <strong>123456</strong></p>
        </div>
      </div>
    </div>
  );

  const Setup2FAPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Smartphone className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Sécurité renforcée</h2>
          <p className="text-gray-600">Activez la double authentification pour sécuriser votre compte</p>
        </div>

        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Pourquoi activer la 2FA ?</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ Limite d'investissement augmentée à 50,000,000 XOF</li>
              <li>✓ Sécurité maximale de votre compte</li>
              <li>✓ Protection contre les accès non autorisés</li>
            </ul>
          </div>

          <div className="text-center">
            <div className="bg-gray-100 p-8 rounded-lg mb-4">
              <div className="text-xs text-gray-500 mb-2">QR Code simulé</div>
              <div className="w-32 h-32 bg-black mx-auto rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">QR Code 2FA</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Scannez avec Google Authenticator ou entrez ce code : <strong>JBSWY3DPEHPK3PXP</strong>
            </p>
          </div>

          <button
            onClick={() => {
              setUser({...user, twoFactorEnabled: true});
              setIsAuthenticated(true);
              setCurrentView('dashboard');
            }}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Activer la 2FA et continuer
          </button>

          <button
            onClick={() => {
              setIsAuthenticated(true);
              setCurrentView('dashboard');
            }}
            className="w-full text-gray-600 hover:text-gray-800 py-2"
          >
            Ignorer pour le moment
          </button>
        </div>
      </div>
    </div>
  );

  const Verify2FAPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Code d'authentification</h2>
          <p className="text-gray-600">Entrez le code de votre application d'authentification</p>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code 2FA</label>
            <input
              type="text"
              name="twoFactorCode"
              value={formData.twoFactorCode}
              onChange={handleInputChange}
              placeholder="123456"
              maxLength="6"
              required
              className="w-full text-center text-2xl tracking-widest px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handle2FAVerification}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Vérification...' : 'Vérifier et se connecter'}
          </button>
        </div>

        <div className="mt-6 text-center bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Code de test : <strong>123456</strong></p>
        </div>
      </div>
    </div>
  );

  // Interface principale après connexion
  const Dashboard = () => {
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
            <a href="#" className="hover:text-blue-200 transition-colors">Profil</a>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-200">Bonjour {user?.name}</p>
              <p className="text-xs text-blue-300">{user?.kycStatus === 'verified' ? '✓ Vérifié + 2FA' : 'Non vérifié'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
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
            Plateforme de tokenisation des dettes souveraines. Investissements en XOF dès 65,000 FCFA.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Sécurisé 2FA</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Rentable</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium">Prix XOF</span>
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
            <span className="font-semibold">{new Date(bond.maturity).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Prix actuel</span>
            <span className="font-semibold">{formatXOF(bond.currentPrice)}</span>
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
        const amount = parseInt(investmentAmount);
        if (amount < 65000) {
          alert('Montant minimum : 65,000 XOF');
          return;
        }
        alert(`Investissement de ${formatXOF(amount)} dans ${selectedBond.symbol} traité avec succès!`);
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
                <X className="h-6 w-6" />
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
                  <span className="font-semibold">{formatXOF(selectedBond.currentPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taux d'intérêt</span>
                  <span className="font-semibold text-green-600">{selectedBond.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Échéance</span>
                  <span className="font-semibold">{new Date(selectedBond.maturity).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Montant d'investissement (XOF)</label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="Minimum: 65,000 XOF"
                  min="65000"
                  step="1000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {investmentAmount && (
                  <p className="text-sm text-gray-600 mt-1">
                    Tokens à recevoir: {(parseFloat(investmentAmount) / selectedBond.currentPrice).toFixed(6)}
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
                disabled={!investmentAmount || parseFloat(investmentAmount) < 65000}
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Valeur totale du portfolio</p>
                <p className="text-4xl font-bold text-blue-600">
                  {formatXOF(calculatePortfolioValue())}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Limite d'investissement : {formatXOF(user?.investmentLimit || 0)}
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
                        <p className="font-bold text-lg">{formatXOF(currentValue)}</p>
                        <p className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gain >= 0 ? '+' : ''}{formatXOF(gain)} ({gainPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );

    const BondsSection = () => (
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Obligations Disponibles</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les opportunités d'investissement en XOF dans les obligations souveraines africaines
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
            © 2025 SovereignBonds. MVP - Authentification Email + 2FA + Prix XOF
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

  // Rendu principal selon l'état
  if (currentView === 'login') return <LoginPage />;
  if (currentView === 'register') return <RegisterPage />;
  if (currentView === 'verify-email') return <EmailVerificationPage />;
  if (currentView === 'setup-2fa') return <Setup2FAPage />;
  if (currentView === 'verify-2fa') return <Verify2FAPage />;
  if (isAuthenticated) return <Dashboard />;

  return <LoginPage />;
};

export default SovereignBondsApp;
