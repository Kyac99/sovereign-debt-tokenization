// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SovereignBondToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BondFactory
 * @dev Factory contract pour créer et gérer des obligations souveraines tokenisées
 * @author Kyac99
 */
contract BondFactory is Ownable, ReentrancyGuard, Pausable {
    
    // Structure pour les émetteurs autorisés
    struct AuthorizedIssuer {
        string name;
        string country;
        bool isActive;
        uint256 totalEmissions;
        uint256 registrationDate;
    }
    
    // Mapping des émetteurs autorisés
    mapping(address => AuthorizedIssuer) public authorizedIssuers;
    
    // Array de toutes les obligations créées
    address[] public allBonds;
    
    // Mapping des obligations par émetteur
    mapping(address => address[]) public bondsByIssuer;
    
    // Mapping des obligations par pays
    mapping(string => address[]) public bondsByCountry;
    
    // Frais de création d'obligation (en wei)
    uint256 public creationFee;
    
    // Adresse du trésor pour collecter les frais
    address public treasury;
    
    // Limites de création
    uint256 public maxBondsPerIssuer = 10;
    uint256 public minMaturityDays = 90; // 3 mois minimum
    uint256 public maxMaturityDays = 3650; // 10 ans maximum
    
    // Événements
    event IssuerAuthorized(address indexed issuer, string name, string country);
    event IssuerDeauthorized(address indexed issuer);
    event BondCreated(
        address indexed bondAddress,
        address indexed issuer,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 maturityDate
    );
    event CreationFeeUpdated(uint256 newFee);
    event TreasuryUpdated(address newTreasury);
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender].isActive, "Not an authorized issuer");
        _;
    }
    
    modifier validMaturity(uint256 maturityDate) {
        uint256 timeToMaturity = maturityDate - block.timestamp;
        require(
            timeToMaturity >= minMaturityDays * 1 days && 
            timeToMaturity <= maxMaturityDays * 1 days,
            "Invalid maturity period"
        );
        _;
    }
    
    constructor(address _treasury, uint256 _creationFee) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        creationFee = _creationFee;
    }
    
    /**
     * @dev Autoriser un nouvel émetteur
     */
    function authorizeIssuer(
        address issuer,
        string memory name,
        string memory country
    ) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(country).length > 0, "Country cannot be empty");
        require(!authorizedIssuers[issuer].isActive, "Issuer already authorized");
        
        authorizedIssuers[issuer] = AuthorizedIssuer({
            name: name,
            country: country,
            isActive: true,
            totalEmissions: 0,
            registrationDate: block.timestamp
        });
        
        emit IssuerAuthorized(issuer, name, country);
    }
    
    /**
     * @dev Retirer l'autorisation d'un émetteur
     */
    function deauthorizeIssuer(address issuer) external onlyOwner {
        require(authorizedIssuers[issuer].isActive, "Issuer not authorized");
        authorizedIssuers[issuer].isActive = false;
        emit IssuerDeauthorized(issuer);
    }
    
    /**
     * @dev Créer une nouvelle obligation
     */
    function createBond(
        string memory name,
        string memory symbol,
        SovereignBondToken.BondMetadata memory bondMetadata,
        uint256 totalSupply,
        uint256 minimumInvestment,
        uint256 maximumInvestment
    ) 
        external 
        payable 
        onlyAuthorizedIssuer 
        validMaturity(bondMetadata.maturityDate)
        nonReentrant 
        whenNotPaused 
        returns (address) 
    {
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(totalSupply > 0, "Total supply must be positive");
        require(minimumInvestment <= maximumInvestment, "Invalid investment limits");
        require(
            bondsByIssuer[msg.sender].length < maxBondsPerIssuer,
            "Maximum bonds per issuer exceeded"
        );
        
        // Valider les métadonnées
        require(bytes(bondMetadata.issuer).length > 0, "Issuer name cannot be empty");
        require(bytes(bondMetadata.country).length > 0, "Country cannot be empty");
        require(bondMetadata.faceValue > 0, "Face value must be positive");
        require(bondMetadata.interestRate > 0, "Interest rate must be positive");
        require(bondMetadata.issuanceDate <= block.timestamp, "Invalid issuance date");
        
        // Créer le nouveau token d'obligation
        SovereignBondToken newBond = new SovereignBondToken(
            name,
            symbol,
            bondMetadata,
            totalSupply,
            minimumInvestment,
            maximumInvestment
        );
        
        address bondAddress = address(newBond);
        
        // Ajouter à nos registres
        allBonds.push(bondAddress);
        bondsByIssuer[msg.sender].push(bondAddress);
        bondsByCountry[bondMetadata.country].push(bondAddress);
        
        // Mettre à jour les statistiques de l'émetteur
        authorizedIssuers[msg.sender].totalEmissions++;
        
        // Transférer les frais au trésor
        if (msg.value > 0) {
            payable(treasury).transfer(msg.value);
        }
        
        emit BondCreated(
            bondAddress,
            msg.sender,
            name,
            symbol,
            totalSupply,
            bondMetadata.maturityDate
        );
        
        return bondAddress;
    }
    
    /**
     * @dev Obtenir toutes les obligations
     */
    function getAllBonds() external view returns (address[] memory) {
        return allBonds;
    }
    
    /**
     * @dev Obtenir les obligations d'un émetteur
     */
    function getBondsByIssuer(address issuer) external view returns (address[] memory) {
        return bondsByIssuer[issuer];
    }
    
    /**
     * @dev Obtenir les obligations d'un pays
     */
    function getBondsByCountry(string memory country) external view returns (address[] memory) {
        return bondsByCountry[country];
    }
    
    /**
     * @dev Obtenir le nombre total d'obligations
     */
    function getTotalBonds() external view returns (uint256) {
        return allBonds.length;
    }
    
    /**
     * @dev Vérifier si une adresse est un émetteur autorisé
     */
    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return authorizedIssuers[issuer].isActive;
    }
    
    /**
     * @dev Mettre à jour les frais de création
     */
    function updateCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
        emit CreationFeeUpdated(newFee);
    }
    
    /**
     * @dev Mettre à jour l'adresse du trésor
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }
    
    /**
     * @dev Mettre à jour les limites de création
     */
    function updateLimits(
        uint256 _maxBondsPerIssuer,
        uint256 _minMaturityDays,
        uint256 _maxMaturityDays
    ) external onlyOwner {
        require(_minMaturityDays < _maxMaturityDays, "Invalid maturity limits");
        require(_maxBondsPerIssuer > 0, "Invalid max bonds limit");
        
        maxBondsPerIssuer = _maxBondsPerIssuer;
        minMaturityDays = _minMaturityDays;
        maxMaturityDays = _maxMaturityDays;
    }
    
    /**
     * @dev Obtenir les informations détaillées d'une obligation
     */
    function getBondInfo(address bondAddress) 
        external 
        view 
        returns (
            string memory name,
            string memory symbol,
            uint256 totalSupply,
            SovereignBondToken.BondMetadata memory metadata
        ) 
    {
        SovereignBondToken bond = SovereignBondToken(bondAddress);
        return (
            bond.name(),
            bond.symbol(),
            bond.totalSupply(),
            bond.bondMetadata()
        );
    }
    
    /**
     * @dev Pause le factory en cas d'urgence
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Reprendre les opérations du factory
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Récupération d'urgence des fonds
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
