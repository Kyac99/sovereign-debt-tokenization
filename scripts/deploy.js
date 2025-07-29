const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('🚀 Début du déploiement des smart contracts...');
  
  // Obtenir le signataire (compte qui déploie)
  const [deployer] = await ethers.getSigners();
  console.log('📝 Déploiement avec le compte:', deployer.address);
  
  // Vérifier le solde
  const balance = await deployer.getBalance();
  console.log('💰 Solde du compte:', ethers.utils.formatEther(balance), 'ETH');

  // Paramètres de déploiement
  const treasuryAddress = deployer.address; // En production, utiliser une adresse multisig
  const creationFee = ethers.utils.parseEther('0.01'); // 0.01 ETH pour créer une obligation

  try {
    // 1. Déployer BondFactory
    console.log('\n📊 Déploiement de BondFactory...');
    const BondFactory = await ethers.getContractFactory('BondFactory');
    const bondFactory = await BondFactory.deploy(treasuryAddress, creationFee);
    await bondFactory.deployed();
    
    console.log('✅ BondFactory déployé à:', bondFactory.address);
    console.log('🏦 Adresse du trésor:', treasuryAddress);
    console.log('💵 Frais de création:', ethers.utils.formatEther(creationFee), 'ETH');

    // 2. Autoriser un émetteur de test
    console.log('\n👤 Autorisation d\'un émetteur de test...');
    const testIssuerTx = await bondFactory.authorizeIssuer(
      deployer.address,
      'République du Burkina Faso',
      'Burkina Faso'
    );
    await testIssuerTx.wait();
    console.log('✅ Émetteur autorisé:', deployer.address);

    // 3. Créer une obligation de test
    console.log('\n🏛️ Création d\'une obligation de test...');
    
    const bondMetadata = {
      issuer: 'République du Burkina Faso',
      country: 'Burkina Faso',
      currency: 'USD',
      faceValue: ethers.utils.parseEther('1000'), // 1000 USD en wei
      interestRate: 650, // 6.5% en basis points
      maturityDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60 * 2), // 2 ans
      issuanceDate: Math.floor(Date.now() / 1000),
      isin: 'BF0000000001',
      isActive: true
    };

    const totalSupply = ethers.utils.parseEther('10000000'); // 10M tokens
    const minimumInvestment = ethers.utils.parseEther('100'); // $100 minimum
    const maximumInvestment = ethers.utils.parseEther('50000'); // $50K maximum

    const createBondTx = await bondFactory.createBond(
      'Burkina Faso 2027 Bond',
      'BF2027',
      bondMetadata,
      totalSupply,
      minimumInvestment,
      maximumInvestment,
      { value: creationFee }
    );
    
    const receipt = await createBondTx.wait();
    
    // Extraire l'adresse du token créé depuis les events
    const bondCreatedEvent = receipt.events?.find(e => e.event === 'BondCreated');
    const bondTokenAddress = bondCreatedEvent?.args?.bondAddress;
    
    console.log('✅ Obligation de test créée à:', bondTokenAddress);

    // 4. Vérifier le déploiement
    console.log('\n🔍 Vérification du déploiement...');
    const allBonds = await bondFactory.getAllBonds();
    console.log('📊 Nombre d\'obligations:', allBonds.length);
    
    if (bondTokenAddress) {
      const SovereignBondToken = await ethers.getContractFactory('SovereignBondToken');
      const bondToken = SovereignBondToken.attach(bondTokenAddress);
      const tokenName = await bondToken.name();
      const tokenSymbol = await bondToken.symbol();
      const tokenSupply = await bondToken.totalSupply();
      
      console.log('🪙 Token créé:', tokenName, '(' + tokenSymbol + ')');
      console.log('📈 Supply totale:', ethers.utils.formatEther(tokenSupply));
    }

    // 5. Sauvegarder les adresses de déploiement
    const deploymentData = {
      network: network.name,
      chainId: network.config.chainId,
      deployer: deployer.address,
      contracts: {
        BondFactory: {
          address: bondFactory.address,
          deploymentTx: bondFactory.deployTransaction.hash
        },
        testBond: bondTokenAddress ? {
          address: bondTokenAddress,
          name: 'Burkina Faso 2027 Bond',
          symbol: 'BF2027'
        } : null
      },
      timestamp: new Date().toISOString()
    };

    // Écrire dans un fichier
    const fs = require('fs');
    const deploymentDir = './deployments';
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    const filename = `${deploymentDir}/${network.name}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
    
    console.log('\n💾 Données de déploiement sauvegardées dans:', filename);

    // 6. Instructions post-déploiement
    console.log('\n📋 INSTRUCTIONS POST-DÉPLOIEMENT:');
    console.log('1. Mettre à jour le fichier .env avec les adresses de contrats:');
    console.log(`   BOND_FACTORY_ADDRESS=${bondFactory.address}`);
    if (bondTokenAddress) {
      console.log(`   SOVEREIGN_BOND_TOKEN_ADDRESS=${bondTokenAddress}`);
    }
    console.log('\n2. Vérifier les contrats sur l\'explorateur de blocs');
    console.log('\n3. Configurer les autorisations d\'émetteurs pour la production');
    console.log('\n4. Effectuer des tests d\'intégration');

    console.log('\n🎉 Déploiement terminé avec succès!');

  } catch (error) {
    console.error('\n❌ Erreur lors du déploiement:', error.message);
    process.exit(1);
  }
}

// Fonction pour nettoyer lors de l'interruption
process.on('SIGINT', () => {
  console.log('\n⏹️ Déploiement interrompu par l\'utilisateur');
  process.exit(0);
});

// Exécuter le script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
