# 🏛️ Tokenisation de Dettes Souveraines & Municipales

## 📋 Description

Plateforme de tokenisation des dettes souveraines permettant à la diaspora africaine d'investir dans des obligations d'États via des tokens. Cette solution démocratise l'accès aux investissements souverains avec authentification email sécurisée et prix en Franc CFA (XOF).

## 🎯 Objectifs

- **Accessibilité** : Investissements dès 65,000 XOF (100 USD)
- **Sécurité** : Authentification email + double authentification (2FA)
- **Transparence** : Utilisation de la blockchain pour la traçabilité
- **Inclusion** : Faciliter l'accès pour la diaspora africaine mondiale

## ✨ Nouvelles Fonctionnalités

### 🔐 Authentification Simplifiée
- ✅ **Connexion par email** (plus besoin de wallet crypto)
- ✅ **Vérification email** avec code à 6 chiffres
- ✅ **2FA obligatoire** avec Google Authenticator
- ✅ **Sécurité renforcée** avec limites d'investissement progressives

### 💰 Prix en Franc CFA (XOF)
- ✅ **Monnaie locale** : Tous les prix en XOF
- ✅ **Investissement minimum** : 65,000 XOF (≈100 USD)
- ✅ **Limites progressives** :
  - Nouveau compte : 650,000 XOF (1,000 USD)
  - Email vérifié : 3,250,000 XOF (5,000 USD)
  - Avec 2FA : 32,500,000 XOF (50,000 USD)

## 🏗️ Architecture

```
sovereign-debt-tokenization/
├── 📄 README.md                     # Documentation principale
├── 📄 INSTALL.md                    # Guide d'installation complet
├── 📄 Dockerfile                    # Configuration Docker
├── 📄 docker-compose.yml            # Orchestration des services
│
├── 📁 contracts/                    # Smart Contracts Solidity
│   ├── SovereignBondToken.sol       # Token principal des obligations
│   └── BondFactory.sol              # Factory pour créer des obligations
│
├── 📁 frontend/                     # Interface utilisateur React
│   ├── package.json                 # Dépendances frontend (sans Web3)
│   └── src/
│       └── App.js                   # Interface avec auth email + 2FA
│
├── 📁 backend/                      # API Node.js
│   ├── package.json                 # Dépendances avec 2FA
│   ├── .env.example                 # Template de configuration
│   └── src/
│       ├── server.js                # Serveur Express principal
│       └── routes/
│           ├── auth.js              # Auth email + 2FA + JWT
│           ├── bonds.js             # Obligations en XOF
│           ├── users.js             # Profils utilisateurs
│           └── transactions.js      # Historique des transactions
│
├── 📁 scripts/                     # Scripts de déploiement
│   └── deploy.js                   # Déploiement smart contracts
│
└── 📁 docs/                        # Documentation technique
    ├── ARCHITECTURE.md              # Architecture technique
    ├── BUSINESS_MODEL.md            # Modèle économique
    └── MVP_COMPLET.md               # État final du MVP
```

## 🚀 Fonctionnalités MVP

### ✅ Authentification Sécurisée
- [x] Inscription par email avec validation
- [x] Vérification email par code 6 chiffres
- [x] Configuration 2FA avec QR Code
- [x] Connexion sécurisée avec JWT
- [x] Gestion des tentatives de connexion
- [x] Réinitialisation de mot de passe

### ✅ Interface Utilisateur
- [x] Pages d'inscription et connexion modernes
- [x] Configuration 2FA guidée
- [x] Dashboard avec portfolio en temps réel
- [x] Liste des obligations en XOF
- [x] Système d'investissement intuitif
- [x] Responsive design pour mobile

### ✅ Gestion des Obligations (XOF)
- [x] **Burkina Faso 2027** - 6.5% - 646,750 XOF
- [x] **Côte d'Ivoire 2028** - 5.8% - 659,750 XOF  
- [x] **Sénégal 2029** - 5.2% - 669,500 XOF
- [x] Calculs automatiques de rendements
- [x] Suivi des disponibilités en temps réel

### ✅ Backend API Complet
- [x] Authentification JWT sécurisée
- [x] Gestion 2FA avec speakeasy
- [x] CRUD obligations avec prix XOF
- [x] Gestion utilisateurs et KYC
- [x] Historique transactions
- [x] Validation et sécurité

## 🛠️ Technologies

- **Frontend** : React.js, Tailwind CSS, Lucide React
- **Backend** : Node.js, Express, JWT, Speakeasy (2FA)
- **Base de données** : MongoDB (simulation)
- **Authentification** : Email + 2FA (Google Authenticator)
- **Smart Contracts** : Solidity (Ethereum/Polygon)

## 📦 Installation Rapide

### Option Docker (Recommandée)
```bash
git clone https://github.com/Kyac99/sovereign-debt-tokenization.git
cd sovereign-debt-tokenization
docker-compose up -d
```

### Option Manuelle
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend  
npm install
npm start
```

## 🎮 Utilisation

### 1. Accès à l'application
- Frontend : http://localhost:3000
- Backend API : http://localhost:3001

### 2. Compte de test
- **Email** : jean.dupont@email.com
- **Mot de passe** : password123
- **Code email** : 123456
- **Code 2FA** : 123456

### 3. Parcours utilisateur
1. **Inscription** avec email et informations personnelles
2. **Vérification email** avec code reçu
3. **Configuration 2FA** (optionnelle mais recommandée)
4. **Connexion** avec email + mot de passe + 2FA
5. **Exploration** des obligations en XOF
6. **Investissement** dès 65,000 XOF
7. **Suivi** du portfolio en temps réel

## 💡 Avantages de la Nouvelle Version

### 🔐 Sécurité Améliorée
- Plus de dépendance aux wallets crypto complexes
- Authentification familière par email
- 2FA standard avec apps mobiles existantes
- Gestion des sessions sécurisée

### 💰 Accessibilité Financière  
- Prix en monnaie locale (XOF)
- Compréhension intuitive des montants
- Pas besoin de cryptomonnaies
- Limites progressives selon le niveau de sécurité

### 🌍 Adoption Facilitée
- Interface familière pour utilisateurs non-crypto
- Processus d'inscription standard
- Support multi-langues (français)
- Compatible avec tous les appareils

## 🌍 Impact Potentiel

### Pour la Diaspora (200M+ personnes)
- Accès démocratisé sans barrières techniques
- Investissements en monnaie familière (XOF)
- Soutien direct au développement de leur pays
- Sécurité bancaire avec rendements attractifs

### Pour les États Africains
- Nouvelle source de financement accessible
- Coûts d'émission réduits
- Accès direct à leur diaspora mondiale
- Modernisation du secteur financier

## 🔄 Feuille de Route

### Phase 2 - Extensions (Q3 2025)
- [ ] KYC/AML complet avec partenaires certifiés
- [ ] Intégration Mobile Money (Orange Money, MTN, etc.)
- [ ] Marché secondaire peer-to-peer
- [ ] Application mobile native
- [ ] Support multilingue (anglais, portugais)

### Phase 3 - Production (Q4 2025)
- [ ] Audit de sécurité professionnel
- [ ] Partenariats gouvernementaux officiels
- [ ] Déploiement mainnet avec vrais tokens
- [ ] Conformité réglementaire complète
- [ ] Programme de liquidité institutionnelle

## 📊 Données de Test

Le MVP inclut 3 obligations réalistes :

1. **🇧🇫 Burkina Faso 2027** 
   - Taux : 6.5% | Prix : 646,750 XOF | Rating : B+

2. **🇨🇮 Côte d'Ivoire 2028**
   - Taux : 5.8% | Prix : 659,750 XOF | Rating : BB-

3. **🇸🇳 Sénégal 2029**
   - Taux : 5.2% | Prix : 669,500 XOF | Rating : BB

## 🔐 Sécurité

- Hash de mots de passe avec bcrypt
- Tokens JWT avec expiration
- Rate limiting sur les APIs
- Validation stricte des entrées
- Logs d'audit complets
- Protection contre brute force

## 📄 Licence

MIT License

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md)

## 📞 Contact

- **Issues GitHub** : [Créer une issue](https://github.com/Kyac99/sovereign-debt-tokenization/issues)
- **Documentation** : Voir le dossier `/docs`

---

## 🎉 Nouveautés v2.0

✅ **Authentification simplifiée** : Email + 2FA remplace les wallets crypto  
✅ **Prix en XOF** : Monnaie locale pour meilleure adoption  
✅ **Sécurité renforcée** : Limites progressives selon niveau de vérification  
✅ **Interface moderne** : Design intuitif et responsive  
✅ **Adoption facilitée** : Plus de barrières techniques  

**🚀 Cette version révolutionne l'accès aux investissements souverains pour la diaspora africaine !**

---

*Créé par Kyac99 - Juillet 2025*  
*Repository : https://github.com/Kyac99/sovereign-debt-tokenization*
