pragma solidity ^0.4.18;
import "zeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "./Token.sol";

contract Crowdsale is Pausable {
    using SafeMath for uint256;

     // Token to be sold
    TESTToken public token;

    // Start and end timestamps where contributions are allowed (both inclusive)
    uint256 public startTime;
    uint256 public endTime;

    // Address where funds are collected
    address public beneficiary;

    // Price of the tokens as in tokens per ether
    uint256 public rate;

    // Amount of raised in Wei
    uint256 public weiRaised;

    // Timelines for contribution limit policy
    uint256 public capReleaseTimestamp;

    uint256 public extraTime;

    // Whitelists of participant address
    mapping(address => bool) public whitelists;

    // Contributions in Wei for each participant
    mapping(address => uint256) public contributions;

    // Funding cap in ETH.
    uint256 public constant FUNDING_ETH_HARD_CAP = 9123 * 1 ether;

    // Min contribution is 0.01 ether
    uint256 public minContribution = 10**16;

    // Max contribution is 1 ether
    uint256 public maxContribution = 10**18;

    //remainCap
    uint256 public remainCap;

    // The current stage of the offering
    Stages public stage;

    enum Stages {
        Setup,
        OfferingStarted,
        OfferingEnded
    }

    event OfferingOpens(uint256 startTime, uint256 endTime);
    event OfferingCloses(uint256 endTime, uint256 totalWeiRaised);
    /**
     * Event for token purchase logging
     *
     * @param purchaser Who paid for the tokens
     * @param value Weis paid for purchase
     * @return amount Amount of tokens purchased
     */
    event TokenPurchase(address indexed purchaser, uint256 value, uint256 amount);

    /**
     * Modifier that requires certain stage before executing the main function body
     *
     * @param expectedStage Value that the current stage is required to match
     */
    modifier atStage(Stages expectedStage) {
        require(stage == expectedStage);
        _;
    }


    /**
     * The constructor of the contract.
     * @param tokenToEtherRate Number of docks per ether
     * @param beneficiaryAddr Address where funds are collected
     */
    function Crowdsale(
        uint256 tokenToEtherRate,
        address beneficiaryAddr,
        address tokenAddress
    ) public {
        require(tokenToEtherRate > 0);
        require(beneficiaryAddr != address(0));
        require(tokenAddress != address(0));

        token = TESTToken(tokenAddress);
        rate = tokenToEtherRate;
        beneficiary = beneficiaryAddr;
        stage = Stages.Setup;
    }

    /**
     * Fallback function can be used to buy tokens
     */
    function () public payable {
        buy();
    }

    /**
     * Withdraw available ethers into beneficiary account, serves as a safety, should never be needed
     */
    function ownerSafeWithdrawal() external onlyOwner {
        beneficiary.transfer(this.balance);
    }

    function updateRate(uint256 tokenToEtherRate) public onlyOwner atStage(Stages.Setup) {
        rate = tokenToEtherRate;
    }

    /**
     * Whitelist participant address
     *
     *
     * @param users Array of addresses to be whitelisted
     */
    function whitelist(address[] users) public onlyOwner {
        for (uint32 i = 0; i < users.length; i++) {
            whitelists[users[i]] = true;
        }
    }
    function whitelistRemove(address user) public onlyOwner{
      require(whitelists[user]);
      whitelists[user] = false;
    }
    /**
     * Start the offering
     *
     * @param durationInSeconds Extra duration of the offering on top of the minimum 4 hours
     */
    function startOffering(uint256 durationInSeconds) public onlyOwner atStage(Stages.Setup) {
        stage = Stages.OfferingStarted;
        startTime = now;
        capReleaseTimestamp = startTime + 0 hours;
        extraTime = capReleaseTimestamp + 7 days;
        endTime = extraTime.add(durationInSeconds);
        OfferingOpens(startTime, endTime);
    }

    /**
     * End the offering
     */
    function endOffering() public onlyOwner atStage(Stages.OfferingStarted) {
        endOfferingImpl();
    }


    /**
     * Function to invest ether to buy tokens, can be called directly or called by the fallback function
     * Only whitelisted users can buy tokens.
     *
     * @return bool Return true if purchase succeeds, false otherwise
     */
    function buy() public payable whenNotPaused atStage(Stages.OfferingStarted) returns (bool) {
        if (whitelists[msg.sender]) {
              buyTokens();
              return true;
        }
        revert();
    }

    /**
     * Function that returns whether offering has ended
     *
     * @return bool Return true if token offering has ended
     */
    function hasEnded() public view returns (bool) {
        return now > endTime || stage == Stages.OfferingEnded;
    }

    /**
     * Modifier that validates a purchase at a tier
     * All the following has to be met:
     * - current time within the offering period
     * - valid sender address and ether value greater than 0.1
     * - total Wei raised not greater than FUNDING_ETH_HARD_CAP
     * - contribution per perticipant within contribution limit
     *
     *
     */
    modifier validPurchase() {
        require(now >= startTime && now <= endTime && stage == Stages.OfferingStarted);
        if(now > capReleaseTimestamp) {
          maxContribution = 9123 * 1 ether;
        }
        uint256 contributionInWei = msg.value;
        address participant = msg.sender;


        require(contributionInWei <= maxContribution.sub(contributions[participant]));
        require(participant != address(0) && contributionInWei >= minContribution && contributionInWei <= maxContribution);
        require(weiRaised.add(contributionInWei) <= FUNDING_ETH_HARD_CAP);

        _;
    }


    function buyTokens() internal validPurchase {

        uint256 contributionInWei = msg.value;
        address participant = msg.sender;

        // Calculate token amount to be distributed
        uint256 tokens = contributionInWei.mul(rate);

        if (!token.transferFrom(token.owner(), participant, tokens)) {
            revert();
        }

        weiRaised = weiRaised.add(contributionInWei);
        contributions[participant] = contributions[participant].add(contributionInWei);

        remainCap = FUNDING_ETH_HARD_CAP.sub(weiRaised);


        // Check if the funding cap has been reached, end the offering if so
        if (weiRaised >= FUNDING_ETH_HARD_CAP) {
            endOfferingImpl();
        }

        // Transfer funds to beneficiary
        beneficiary.transfer(contributionInWei);
        TokenPurchase(msg.sender, contributionInWei, tokens);
    }


    /**
     * End token offering by set the stage and endTime
     */
    function endOfferingImpl() internal {
        endTime = now;
        stage = Stages.OfferingEnded;
        OfferingCloses(endTime, weiRaised);
    }

    /**
     * Allocate tokens for presale participants before public offering, can only be executed at Stages.Setup stage.
     *
     * @param to Participant address to send docks to
     * @param tokens Amount of docks to be sent to parcitipant
     */
    function allocateTokensBeforeOffering(address to, uint256 tokens) public onlyOwner atStage(Stages.Setup) returns (bool) {
        if (!token.transferFrom(token.owner(), to, tokens)) {
            revert();
        }
        return true;
    }

    /**
     * Bulk version of allocateTokensBeforeOffering
     */
    function batchAllocateTokensBeforeOffering(address[] toList, uint256[] tokensList) external onlyOwner  atStage(Stages.Setup)  returns (bool)  {
        require(toList.length == tokensList.length);

        for (uint32 i = 0; i < toList.length; i++) {
            allocateTokensBeforeOffering(toList[i], tokensList[i]);
        }
        return true;
    }

}