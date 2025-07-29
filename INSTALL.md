# 🚀 Guide d'Installation et de Démarrage

Ce guide vous accompagne pour installer et démarrer le MVP de tokenisation des dettes souveraines.

## 📋 Prérequis

### Logiciels requis
- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Docker** et **Docker Compose** (pour l'environnement containerisé)
- **Git**
- **MetaMask** (extension navigateur)

### Connaissances recommandées
- Bases de React.js
- Notions de blockchain et Web3
- Utilisation de Docker (optionnel)

## 🛠️ Installation

### Option 1: Installation locale

1. **Cloner le repository**
```bash
git clone https://github.com/Kyac99/sovereign-debt-tokenization.git
cd sovereign-debt-tokenization
```

2. **Configuration de l'environnement backend**
```bash
cd backend
cp .env.example .env
# Éditer .env avec vos configurations
npm install
```

3. **Configuration du frontend**
```bash
cd ../frontend
npm install
```

4. **Démarrer les services**

Backend (terminal 1):
```bash
cd backend
npm run dev
```

Frontend (terminal 2):
```bash
cd frontend
npm start
```

### Option 2: Avec Docker (Recommandé)

1. **Cloner et démarrer**
```bash
git clone https://github.com/Kyac99/sovereign-debt-tokenization.git
cd sovereign-debt-tokenization
docker-compose up -d
```

2. **Vérifier les services**
```bash
docker-compose ps
```

## 🔧 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```env
# Backend
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/sovereign-bonds
JWT_SECRET=your-secret-key

# Blockchain (pour les tests)
ETHEREUM_RPC_URL=http://localhost:8545
PRIVATE_KEY=your-private-key
```

### Configuration MetaMask

1. **Ajouter un réseau local** (si vous utilisez Ganache)
   - Nom du réseau : `Local Ganache`
   - RPC URL : `http://localhost:8545`
   - Chain ID : `1337`
   - Symbole : `ETH`

2. **Importer un compte de test**
   - Utilisez une des clés privées générées par Ganache

## 🏃‍♂️ Utilisation du MVP

### 1. Première connexion

1. Ouvrez votre navigateur sur `http://localhost:3000`
2. Cliquez sur "Connecter Wallet"
3. Approuvez la connexion dans MetaMask

### 2. Explorer les obligations

- Consultez les obligations disponibles sur la page d'accueil
- Chaque carte affiche :
  - Pays émetteur
  - Taux d'intérêt
  - Date d'échéance
  - Prix actuel
  - Rating

### 3. Effectuer un investissement

1. Cliquez sur "Investir" sur une obligation
2. Saisissez le montant (minimum $100)
3. Confirmez la transaction
4. Approuvez dans MetaMask

### 4. Consulter votre portfolio

- Votre portfolio s'affiche automatiquement après connexion
- Voir les gains/pertes en temps réel
- Historique des transactions

## 🔗 Déploiement des Smart Contracts

### Sur un réseau local (Ganache)

1. **Démarrer Ganache**
```bash
docker-compose up ganache
```

2. **Installer Hardhat**
```bash
npm install -g hardhat
cd contracts
npm install
```

3. **Compiler les contrats**
```bash
npx hardhat compile
```

4. **Déployer**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Sur un testnet (Sepolia/Mumbai)

1. **Configurer hardhat.config.js**
```javascript
module.exports = {
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  }
};
```

2. **Déployer sur testnet**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 🧪 Tests

### Tests unitaires
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Tests d'intégration
```bash
# Avec tous les services Docker
docker-compose up -d
npm run test:integration
```

## 📊 Monitoring et Logs

### Accès aux logs
```bash
# Via Docker
docker-compose logs -f backend

# Local
tail -f backend/logs/app.log
```

### Métriques (avec profil monitoring)
```bash
docker-compose --profile monitoring up -d
```

Accès :
- Prometheus : `http://localhost:9090`
- Grafana : `http://localhost:3010` (admin/admin123)

## 🔐 Sécurité

### Checklist de sécurité pour la production

- [ ] Changer tous les mots de passe par défaut
- [ ] Configurer HTTPS avec certificats SSL
- [ ] Activer le rate limiting
- [ ] Configurer les CORS appropriés
- [ ] Auditer les smart contracts
- [ ] Implémenter le monitoring d'erreurs
- [ ] Sauvegardes automatiques de la DB

### Variables d'environnement sensibles

Ne jamais committer :
- Clés privées blockchain
- Secrets JWT
- Mots de passe de base de données
- Clés API externes

## 🚨 Résolution de problèmes

### Problèmes courants

**Erreur de connexion MetaMask**
```
Solution: Vérifier que MetaMask est connecté au bon réseau
```

**Erreur "Transaction failed"**
```
Solution: Vérifier le solde ETH et les gas fees
```

**API non accessible**
```bash
# Vérifier que le backend est démarré
curl http://localhost:3001/health
```

**Base de données non accessible**
```bash
# Vérifier MongoDB
docker-compose logs mongodb
```

### Commandes de debug

```bash
# Redémarrer tous les services
docker-compose restart

# Nettoyer et reconstruire
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Logs en temps réel
docker-compose logs -f
```

## 📈 Étapes suivantes

Après avoir testé le MVP :

1. **Phase 2 - Améliorations**
   - Implémentation KYC/AML complète
   - Marché secondaire
   - Intégration fiat
   - Application mobile

2. **Production**
   - Audit de sécurité
   - Tests de charge
   - Déploiement sur mainnet
   - Partenariats gouvernementaux

## 📞 Support

- **Issues GitHub** : [Créer une issue](https://github.com/Kyac99/sovereign-debt-tokenization/issues)
- **Documentation** : Voir le dossier `/docs`
- **Email** : support@sovereignbonds.com

## 🤝 Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines de contribution.

---

**⚠️ Avertissement**: Ce MVP est à des fins de démonstration. Ne pas utiliser en production sans audit de sécurité complet.
