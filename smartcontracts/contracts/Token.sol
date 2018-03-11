pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/BasicToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract TESTToken is StandardToken, Ownable {
    string public constant symbol = "TEST";
    string public constant name = "TESTToken";
    uint8 public constant decimals = 18;
    uint256 public constant INITIAL_SUPPLY = 1000000000 * (10 ** uint256(decimals));
    uint256 public constant TOKEN_OFFERING_ALLOWANCE = 1000000000 * (10 ** uint256(decimals));
    uint256 public constant ADMIN_ALLOWANCE = INITIAL_SUPPLY - TOKEN_OFFERING_ALLOWANCE;

    // Address of token admin
    address public adminAddr;

    // Address of token offering
	address public tokenOfferingAddr;

    // Enable transfers after conclusion of token offering
    bool public transferEnabled = false;

    /**
     * Check if transfer is allowed
     *
     * Permissions:
     *                                                       Owner    Admin    OffeirngContract    Others
     * transfer (before transferEnabled is true)               x        x            x               x
     * transferFrom (before transferEnabled is true)           x        v            v               x
     * transfer/transferFrom after transferEnabled is true     v        x            x               v
     */
    modifier onlyWhenTransferAllowed() {
        require(transferEnabled || msg.sender == adminAddr || msg.sender == tokenOfferingAddr);
        _;
    }

    /**
     * Check if token offering address is set or not
     */
    modifier onlyTokenOfferingAddrNotSet() {
        require(tokenOfferingAddr == address(0x0));
        _;
    }

    /**
     * Check if address is a valid destination to transfer tokens to
     * - must not be zero address
     * - must not be the token address
     * - must not be the owner's address
     * - must not be the admin's address
     * - must not be the token offering contract address
     */
    modifier validDestination(address to) {
        require(to != address(0x0));
        require(to != address(this));
        require(to != owner);
        require(to != address(adminAddr));
        require(to != address(tokenOfferingAddr));
        _;
    }

    /**
     * Token contract constructor
     *
     * @param admin Address of admin account
     */
    function TESTToken(address admin) public {
        totalSupply_ = INITIAL_SUPPLY;

        // Mint tokens
        balances[msg.sender] = totalSupply_;
        Transfer(address(0x0), msg.sender, totalSupply_);

        // Approve allowance for admin account
        adminAddr = admin;
        approve(adminAddr, ADMIN_ALLOWANCE);
    }

    /**
     * Set token offering to approve allowance for offering contract to distribute tokens
     *
     * @param offeringAddr Address of token offering contract
     * @param amountForSale Amount of tokens for sale, set 0 to max out
     */
    function setTokenOffering(address offeringAddr, uint256 amountForSale) external onlyOwner onlyTokenOfferingAddrNotSet {
        require(!transferEnabled);

        uint256 amount = (amountForSale == 0) ? TOKEN_OFFERING_ALLOWANCE : amountForSale;
        require(amount <= TOKEN_OFFERING_ALLOWANCE);

        approve(offeringAddr, amount);
        tokenOfferingAddr = offeringAddr;
    }

    /**
     * Enable transfers
     */
    function enableTransfer() external onlyOwner {
        transferEnabled = true;

        // End the offering
        approve(tokenOfferingAddr, 0);
    }

    /**
     * Transfer from sender to another account
     *
     * @param to Destination address
     * @param value Amount of docks to send
     */
    function transfer(address to, uint256 value) public onlyWhenTransferAllowed validDestination(to) returns (bool) {
        return super.transfer(to, value);
    }

    /**
     * Transfer from `from` account to `to` account using allowance in `from` account to the sender
     *
     * @param from Origin address
     * @param to Destination address
     * @param value Amount of docks to send
     */
    function transferFrom(address from, address to, uint256 value) public onlyWhenTransferAllowed validDestination(to) returns (bool) {
        return super.transferFrom(from, to, value);
    }

}

