# 🏛️ Tokenisation de Dettes Souveraines & Municipales

## 📋 Description

Plateforme blockchain permettant à la diaspora d'investir dans des obligations d'États et municipales via des tokens ERC-20. Cette solution démocratise l'accès aux investissements souverains traditionnellement réservés aux grandes institutions.

## 🎯 Objectifs

- **Accessibilité** : Permettre des investissements à partir de petits montants
- **Transparence** : Utilisation de la blockchain pour la traçabilité
- **Liquidité** : Possibilité d'échanger les tokens sur des marchés secondaires
- **Inclusion** : Faciliter l'accès pour la diaspora mondiale

## 🏗️ Architecture

```
sovereign-debt-tokenization/
├── contracts/                 # Smart contracts Solidity
│   ├── SovereignBondToken.sol # Token principal
│   ├── BondFactory.sol        # Factory pour créer des obligations
│   └── Marketplace.sol        # Marché secondaire
├── frontend/                  # Interface utilisateur React
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                   # API Node.js
│   ├── src/
│   ├── routes/
│   └── package.json
├── docs/                      # Documentation
└── scripts/                   # Scripts de déploiement
```

## 🚀 Fonctionnalités MVP

### ✅ Phase 1 - MVP
- [ ] Smart contract de tokenisation des obligations
- [ ] Interface utilisateur basique
- [ ] Système d'authentification
- [ ] Achat/vente de tokens
- [ ] Visualisation du portefeuille

### 🔄 Phase 2 - Améliorations
- [ ] KYC/AML intégré
- [ ] Marché secondaire
- [ ] Intégration fiat
- [ ] Analytics avancées
- [ ] Mobile app

## 🛠️ Technologies

- **Blockchain** : Ethereum / Polygon
- **Smart Contracts** : Solidity
- **Frontend** : React.js, Web3.js
- **Backend** : Node.js, Express
- **Base de données** : MongoDB
- **Authentification** : MetaMask, WalletConnect

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/Kyac99/sovereign-debt-tokenization.git
cd sovereign-debt-tokenization

# Installer les dépendances
npm install

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos clés

# Démarrer le développement
npm run dev
```

## 🔐 Sécurité

- Audits de smart contracts
- Multisig pour les fonctions critiques
- Limitation des montants
- Timelock pour les mises à jour

## 📄 Licence

MIT License

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md)

## 📞 Contact

Pour questions et support : [GitHub Issues](https://github.com/Kyac99/sovereign-debt-tokenization/issues)
