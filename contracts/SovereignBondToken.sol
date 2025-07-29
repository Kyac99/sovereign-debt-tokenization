// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SovereignBondToken
 * @dev Token ERC20 représentant une obligation souveraine tokenisée
 * @author Kyac99
 */
contract SovereignBondToken is ERC20, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // Structure des métadonnées de l'obligation
    struct BondMetadata {
        string issuer;              // Émetteur (gouvernement, municipalité)
        string country;             // Pays d'émission
        string currency;            // Devise de l'obligation
        uint256 faceValue;          // Valeur nominale en wei
        uint256 interestRate;       // Taux d'intérêt annuel en basis points (100 = 1%)
        uint256 maturityDate;       // Date d'échéance (timestamp)
        uint256 issuanceDate;       // Date d'émission (timestamp)
        string isin;                // Numéro ISIN de l'obligation
        bool isActive;              // Statut actif/inactif
    }
    
    // Métadonnées de l'obligation
    BondMetadata public bondMetadata;
    
    // Mapping des balances gelées pour KYC
    mapping(address => bool) public kycVerified;
    
    // Minimum d'investissement
    uint256 public minimumInvestment;
    
    // Maximum d'investissement par utilisateur
    uint256 public maximumInvestment;
    
    // Total des intérêts distribués
    uint256 public totalInterestDistributed;
    
    // Dernière date de distribution d'intérêts
    uint256 public lastInterestDistribution;
    
    // Événements
    event InterestDistributed(uint256 amount, uint256 timestamp);
    event KYCStatusUpdated(address indexed user, bool status);
    event BondMatured(uint256 timestamp);
    event InvestmentLimitsUpdated(uint256 minimum, uint256 maximum);
    
    modifier onlyKYCVerified(address account) {
        require(kycVerified[account], "KYC verification required");
        _;
    }
    
    modifier bondNotMatured() {
        require(block.timestamp < bondMetadata.maturityDate, "Bond has matured");
        _;
    }
    
    modifier bondMatured() {
        require(block.timestamp >= bondMetadata.maturityDate, "Bond not yet matured");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        BondMetadata memory _bondMetadata,
        uint256 _totalSupply,
        uint256 _minimumInvestment,
        uint256 _maximumInvestment
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(_bondMetadata.maturityDate > block.timestamp, "Maturity date must be in the future");
        require(_bondMetadata.interestRate > 0, "Interest rate must be positive");
        require(_totalSupply > 0, "Total supply must be positive");
        
        bondMetadata = _bondMetadata;
        minimumInvestment = _minimumInvestment;
        maximumInvestment = _maximumInvestment;
        lastInterestDistribution = block.timestamp;
        
        // Mint initial supply to contract owner
        _mint(msg.sender, _totalSupply);
    }
    
    /**
     * @dev Override transfer function to include KYC verification
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        onlyKYCVerified(msg.sender) 
        onlyKYCVerified(to) 
        bondNotMatured
        returns (bool) 
    {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom function to include KYC verification
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        onlyKYCVerified(from) 
        onlyKYCVerified(to) 
        bondNotMatured
        returns (bool) 
    {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Achat de tokens d'obligation avec vérification des limites
     */
    function buyBonds(address investor, uint256 amount) 
        external 
        onlyOwner 
        onlyKYCVerified(investor) 
        bondNotMatured 
        nonReentrant 
    {
        require(amount >= minimumInvestment, "Amount below minimum investment");
        require(
            balanceOf(investor) + amount <= maximumInvestment, 
            "Amount exceeds maximum investment per user"
        );
        
        _transfer(owner(), investor, amount);
    }
    
    /**
     * @dev Mise à jour du statut KYC d'un utilisateur
     */
    function updateKYCStatus(address user, bool status) external onlyOwner {
        kycVerified[user] = status;
        emit KYCStatusUpdated(user, status);
    }
    
    /**
     * @dev Mise à jour des limites d'investissement
     */
    function updateInvestmentLimits(uint256 _minimum, uint256 _maximum) external onlyOwner {
        require(_minimum <= _maximum, "Minimum cannot exceed maximum");
        minimumInvestment = _minimum;
        maximumInvestment = _maximum;
        emit InvestmentLimitsUpdated(_minimum, _maximum);
    }
    
    /**
     * @dev Distribution d'intérêts aux détenteurs de tokens
     */
    function distributeInterest() external payable onlyOwner bondNotMatured nonReentrant {
        require(msg.value > 0, "Interest amount must be positive");
        require(
            block.timestamp >= lastInterestDistribution + 90 days, 
            "Interest can only be distributed quarterly"
        );
        
        totalInterestDistributed += msg.value;
        lastInterestDistribution = block.timestamp;
        
        emit InterestDistributed(msg.value, block.timestamp);
        
        // Note: Dans une implémentation complète, nous distribuerions proportionnellement
        // aux détenteurs. Pour le MVP, nous stockons les fonds pour retrait manuel.
    }
    
    /**
     * @dev Retrait des intérêts par les détenteurs (proportionnel à leur détention)
     */
    function claimInterest() external onlyKYCVerified(msg.sender) nonReentrant {
        uint256 userBalance = balanceOf(msg.sender);
        require(userBalance > 0, "No tokens held");
        
        uint256 interestShare = (address(this).balance * userBalance) / totalSupply();
        require(interestShare > 0, "No interest to claim");
        
        payable(msg.sender).transfer(interestShare);
    }
    
    /**
     * @dev Remboursement à l'échéance
     */
    function redeemAtMaturity() external onlyKYCVerified(msg.sender) bondMatured nonReentrant {
        uint256 userBalance = balanceOf(msg.sender);
        require(userBalance > 0, "No tokens to redeem");
        
        uint256 redemptionValue = (userBalance * bondMetadata.faceValue) / totalSupply();
        
        _burn(msg.sender, userBalance);
        payable(msg.sender).transfer(redemptionValue);
    }
    
    /**
     * @dev Calcul de la valeur actuelle d'un token
     */
    function getCurrentTokenValue() external view returns (uint256) {
        if (block.timestamp >= bondMetadata.maturityDate) {
            return bondMetadata.faceValue / totalSupply();
        }
        
        // Calcul simplifié basé sur la valeur nominale et les intérêts courus
        uint256 timeToMaturity = bondMetadata.maturityDate - block.timestamp;
        uint256 annualInterest = (bondMetadata.faceValue * bondMetadata.interestRate) / 10000;
        uint256 accruedInterest = (annualInterest * (block.timestamp - bondMetadata.issuanceDate)) / 365 days;
        
        return (bondMetadata.faceValue + accruedInterest) / totalSupply();
    }
    
    /**
     * @dev Suspension des transferts en cas d'urgence
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Reprise des transferts
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override pour supporter les fonctions de pause
     */
    function _update(address from, address to, uint256 value) 
        internal 
        override(ERC20, ERC20Pausable) 
    {
        super._update(from, to, value);
    }
    
    /**
     * @dev Fonction de fallback pour recevoir des ETH
     */
    receive() external payable {
        // Accepter les paiements ETH pour les distributions d'intérêts
    }
    
    /**
     * @dev Retrait d'urgence par le propriétaire
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
