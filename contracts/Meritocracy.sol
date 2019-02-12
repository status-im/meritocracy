pragma solidity ^0.5.0;

/*
Future Goals:
- remove admins necessity
- encourage contributors to allocate
- needs incentive for someone to call forfeit
- read from previous versions of the script

DApp:
- show tokens to allocate
- allocate token to person with praise
- leaderboard, showing amount totalReceived and totalForfeited and amount, praises https://codepen.io/lewismcarey/pen/GJZVoG
- allows you to send SNT to meritocracy
- add/remove contributor
- add/remove adminstrator

Extension:
- Command:
    - above command = display allocation, received, withdraw button, allocate button? (might be better in dapp)
    - /kudos 500 "<person>" "<praise>"
*/

import "token/ERC20Token.sol";

contract Meritocracy {

    struct Status {
        address author;
        string praise;
        uint256 amount;
        uint256 time; // block.timestamp
    }

    struct Contributor {
        address addr;
        uint256 allocation; // Amount they can send to other contributors, and amount they forfeit, when forfeit just zero this out and leave Token in contract, Owner can use escape to receive it back
        uint256 totalForfeited; // Allocations they've burnt, can be used to show non-active players.
        uint256 totalReceived;
        uint256 received; // Ignore amounts in Status struct, and use this as source of truth, can withdraw at any time
        // bool inPot; // Require Contributor WARN: commented because there's some edge cases not dealt with
        Status[] status;
    }

    ERC20Token public token; // token contract
    address payable public owner; // contract owner
    uint256 public lastForfeit; // timestamp to block admins calling forfeitAllocations too quickly
    address[] public registry; // array of contributor addresses
    uint256 public maxContributors; // Dynamic finite limit on registry.
    mapping(address => bool) public admins;
    mapping(address => Contributor) public contributors;

    Meritocracy public previousMeritocracy; // Reference and read from previous contract

    // Modifiers --------------------------------------------------------------------------------------------

    // Functions only Owner can call
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Functions only Admin can call
    modifier onlyAdmin() {
        require(admins[msg.sender]);
        _;
    }

    // Open Functions  --------------------------------------------------------------------------------------

    // Split amount over each contributor in registry, any contributor can allocate? TODO maybe relax this restriction, so anyone can allocate tokens
    function allocate(uint256 _amount) external {
        // Locals
        uint256 individualAmount;
        // Contributor memory cAllocator = contributors[msg.sender];
        // Requirements
        // require(cAllocator.addr != address(0)); // is sender a Contributor? TODO maybe relax this restriction.
        require(token.transferFrom(msg.sender, address(this), _amount));
        // Body
        // cAllocator.inPot = true;
        individualAmount = _amount / registry.length;
        for (uint256 i = 0; i < registry.length; i++) {
               contributors[registry[i]].allocation += individualAmount;
        }
    }

    // Getter for Dynamic Array Length
    function registryLength() public view returns (uint256) {
        return registry.length;
    }

    // Contributor Functions --------------------------------------------------------------------------------

    // Allows a contributor to withdraw their received Token, when their allocation is 0
    function withdraw() external {
        // Locals
         Contributor storage cReceiver = contributors[msg.sender];
         // Requirements
        require(cReceiver.addr == msg.sender); //is sender a Contributor?
        require(cReceiver.received > 0); // Contributor has received some tokens
        require(cReceiver.allocation == 0); // Contributor must allocate all Token (or have Token burnt)  before they can withdraw.
        // require(cReceiver.inPot); // Contributor has put some tokens into the pot
        // Body
        uint256 r = cReceiver.received;
        cReceiver.received = 0;
        // cReceiver.inPot = false;
        token.transferFrom(address(this), cReceiver.addr, r);
    }

    // TODO: for different UI
    // function awardMultipleContributors ( address[][2] _contributors ) external {

    // }

    // Allow Contributors to award allocated tokens to other Contributors
    function award(address _contributor, uint256 _amount,  string calldata _praise) external {
        // Locals
        Contributor storage cSender = contributors[msg.sender];
        Contributor storage cReceiver = contributors[_contributor];
        // Requirements
        require(_amount > 0); // Allow Non-Zero amounts only
        require(cSender.addr == msg.sender); // Ensure Contributors both exist, and isn't the same address 
        require(cReceiver.addr == _contributor);
        require(cSender.addr != cReceiver.addr); // cannot send to self
        require(cSender.allocation >= _amount); // Ensure Sender has enough tokens to allocate
        // Body
        cSender.allocation -= _amount; // burn is not adjusted, which is done only in forfeitAllocations
        cReceiver.received += _amount;
        cReceiver.totalReceived += _amount;

        Status memory s = Status({
            author: cSender.addr,
            praise: _praise,
            amount: _amount,
            time: block.timestamp
        });

        cReceiver.status.push(s); // Record the history
    }

    // Admin Functions  -------------------------------------------------------------------------------------

    // Add Contributor to Registry
    function addContributor(address _contributor) public onlyAdmin() {
        // Requirements
        require(registry.length + 1 <= maxContributors); // Don't go out of bounds
        require(contributors[_contributor].addr == address(0)); // Contributor doesn't exist
        // Body
        Contributor storage c = contributors[_contributor];
        c.addr = _contributor;
        registry.push(_contributor);
    }

    // Add Multiple Contributors to the Registry in one tx
    function addContributors(address[] calldata _newContributors ) external onlyAdmin() {
        // Locals
        uint256 newContributorLength = _newContributors.length;
        // Requirements
        require(registry.length + newContributorLength <= maxContributors); // Don't go out of bounds
        // Body
        for (uint256 i = 0; i < newContributorLength; i++) {
                addContributor(_newContributors[i]);
        }
    }

    // Remove Contributor from Registry
    // Note: Should not be easy to remove multiple contributors in one tx
    // WARN: Changed to idx, client can do loop by enumerating registry
    function removeContributor(uint256 idx) external onlyAdmin() { // address _contributor
        // Locals
        uint256 registryLen = registry.length - 1;
        // Requirements
        require(idx < registryLen); // idx needs to be smaller than registry.length - 1 OR maxContributors
        // Body
        address c = registry[idx];
        // Swap & Pop!
        registry[idx] = registry[registryLen];
        registry.pop();
        delete contributors[c]; // TODO check if this works
    }

    // Implictly sets a finite limit to registry length
    function setMaxContributors(uint256 _maxContributors) external onlyAdmin() {
        require(_maxContributors > registry.length); // have to removeContributor first
        // Body
        maxContributors = _maxContributors;
    }

    // Zero-out allocations for contributors, minimum once a week, if allocation still exists, add to burn
    function forfeitAllocations() public onlyAdmin() {
        // Locals
        uint256 registryLen = registry.length;
        // Requirements
        require(block.timestamp >= lastForfeit + 1 weeks); // prevents admins accidently calling too quickly.
        // Body
        lastForfeit = block.timestamp; 
        for (uint256 i = 0; i < registryLen; i++) { // should never be longer than maxContributors, see addContributor
                Contributor storage c = contributors[registry[i]];
                c.totalForfeited += c.allocation; // Shaaaaame!
                c.allocation = 0;
                // cReceiver.inPot = false; // Contributor has to put tokens into next round
        }
    }

    // Owner Functions  -------------------------------------------------------------------------------------

    // Set Admin flag for address to true
    function addAdmin(address _admin) public onlyOwner() {
        admins[_admin] = true;
    }

    //  Set Admin flag for address to false
    function removeAdmin(address _admin) public onlyOwner() {
        delete admins[_admin];
    }

    // Change owner address, ideally to a management contract or multisig
    function changeOwner(address payable _owner) external onlyOwner() {
        // Body
        removeAdmin(owner);
        addAdmin(_owner);
        owner = _owner;
    }

    // Change Token address
    // WARN: call escape first, or escape(token);
    function changeToken(address _token) external onlyOwner() {
        // Body
        // Zero-out allocation and received, send out received tokens before token switch.
        for (uint256 i = 0; i < registry.length; i++) {
                Contributor storage c = contributors[registry[i]];
                uint256 r =  c.received;
                c.received = 0;
                c.allocation = 0;
                // WARN: Should totalReceived and totalForfeited be zeroed-out? 
                token.transferFrom(address(this), c.addr, r); // Transfer any owed tokens to contributor 
        }
        lastForfeit = block.timestamp;
        token = ERC20Token(_token);
    }

    // Failsafe, Owner can escape hatch all Tokens and ETH from Contract.
    function escape() public onlyOwner() {
        // Body
        token.transferFrom(address(this), owner,  token.balanceOf(address(this)));
        owner.transfer(address(this).balance);
    }

    // Overloaded failsafe function, recourse incase changeToken is called before escape and funds are in a different token
    // Don't want to require in changeToken incase bad behaviour of ERC20 token
    function escape(address _token) external onlyOwner() {
        // Body
        ERC20Token t = ERC20Token(_token);
        t.transferFrom(address(this), owner,  t.balanceOf(address(this)));
        escape();
    }

    // Housekeeping -----------------------------------------------------------------------------------------

    // function importPreviousMeritocracyData() private onlyOwner() { // onlyOwner not explicitly needed but safer than sorry, it's problem with overloaded function
    //      // if previousMeritocracy != address(0) { // TODO better truthiness test, casting?
    //      //        // Do Stuff
    //      // }
    // }

    // Constructor ------------------------------------------------------------------------------------------

    // constructor(address _token, uint256 _maxContributors, address _previousMeritocracy) public {
        
    // }

    // Set Owner, Token address,  initial maxContributors
    constructor(address _token, uint256 _maxContributors) public {
        // Body
        owner = msg.sender;
        addAdmin(owner);
        lastForfeit = block.timestamp;
        token = ERC20Token(_token);
        maxContributors= _maxContributors;
        // previousMeritocracy = Meritocracy(_previousMeritocracy);
        // importPreviousMeritocracyData() TODO
    }
}