pragma solidity ^0.5.0;

/*
Future Goals:
- remove admins necessity
- encourage contributors to allocate

DApp:
- show tokens to allocate
- allocate token to person with praise
- leaderboard, showing amount totalReceived and totalForfeited and amount, praises https://codepen.io/lewismcarey/pen/GJZVoG
- allows you to send SNT to meritocracy
- add/remove contributor
- add/remove adminstrator
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

    address public token; // token contract
    address payable public owner; // contract owner
    uint256 public lastForfeit; // timestamp to block admins calling forfeitAllocations too quickly
    address[] public registry; // array of contributor addresses
    uint256 public maxContributors; // Dynamic finite limit on registry.
    mapping(address => bool) admins;
    mapping(address => Contributor) contributors;

    // Open Functions  ----------------------------------------------------------------------------------------

    // Access a contributors award history for leaderboard
    // function status (address _contributor) external view returns (Status[] status) {
    //     // TODO can return array of struct ?? 
    //     // i
    //     status = contributors[_contributor].status;
    // }

    // Split amount over each contributor in registry, anyone can contribute.
    function allocate(uint256 _amount) external {
        // Locals
        uint256 individualAmount;
        Contributor memory cAllocator = contributors[msg.sender];
        // Requirements
        require(cAllocator.addr == msg.sender); // is sender a Contributor?
        // require(ERC20Token(token).transferFrom(msg.sender, address(this), _amount)); // TODO fix this, check balance Contributor has funds to allocate
        // Body
        // cAllocator.inPot = true;
        individualAmount = _amount / registry.length;
        for (uint256 i = 0; i < registry.length; i++) {
               contributors[registry[i]].allocation += individualAmount;
        }
    }

    // Contributor Functions -------------------------------------------------------------------------------

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
        ERC20Token(token).transferFrom(address(this), cReceiver.addr, r);
    }

    // Allow Contributors to award allocated tokens to other Contributors
    function award(address _contributor, uint256 _amount,  string calldata _praise) external {
        // Locals
        Contributor storage cSender = contributors[msg.sender];
        Contributor storage cReceiver = contributors[_contributor];
        // Requirements
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
    function addContributor(address _contributor) public {
        // Requirements
        require(admins[msg.sender]);
        require(registry.length + 1 <= maxContributors);
        require(contributors[_contributor].addr != _contributor); // WARN: check if contributor already exists?
        // Body
        Contributor storage c = contributors[_contributor];
        c.addr = _contributor;
        registry.push(_contributor);
    }

    // Add Multiple Contributors to Tegistry in one tx
    function addContributors(address[] calldata _newContributors ) external {
        // Requirements
        require(registry.length + _newContributors.length <= maxContributors);
        // Body
        for (uint256 i = 0; i < _newContributors.length; i++) {
                addContributor(_newContributors[i]);
        }
    }

    // Remove Contributor from Registry
    // Note: Should not be easy to remove multiple contributors in one tx
    function removeContributor(address _contributor) external {
        // Requirements
        require(admins[msg.sender]);
        // Body
        // Find id of contributor address
        uint256 idx = 0;
        for (uint256 i = 0; i < registry.length; i++) { // should never be longer than maxContributors, see addContributor
                if (registry[i] == _contributor) {
                    idx = i;
                    break;
                }
        }

        address c = registry[idx];
        // Swap & Pop!
        registry[idx] = registry[registry.length - 1];
        registry.pop();
        delete contributors[c]; // TODO check if this works
    }

    // Implictly sets a finite limit to registry length
    function setMaxContributors(uint256 _maxContributors) external {
        // Requirements
        require(admins[msg.sender]);
        require(_maxContributors > registry.length); // have to removeContributor first
        // Body
        maxContributors = _maxContributors;
    }

    // Zero-out allocations for contributors, minimum once a week, if allocation still exists, add to burn
    function forfeitAllocations() public {
        // Requirements
        require(admins[msg.sender]);
        require(block.timestamp >= lastForfeit + 1 weeks); // prevents multiple admins accidently calling too quickly.
        // Body
        lastForfeit = block.timestamp; 
        
        for (uint256 i = 0; i < registry.length; i++) { // should never be longer than maxContributors, see addContributor
                Contributor storage c = contributors[registry[i]];
                c.totalForfeited += c.allocation; // Shaaaaame!
                c.allocation = 0;
                // cReceiver.inPot = false; // Contributor has to put tokens into next round
        }
    }

    // Owner Functions  -------------------------------------------------------------------------------------

    // Set Admin flag for address to true
    function addAdmin(address _admin) public {
        // Requirements
        require(msg.sender == owner);
        // Body
        admins[_admin] = true;
    }

    //  Set Admin flag for address to false
    function removeAdmin(address _admin) public {
        // Requirements
        require(msg.sender == owner);
        // Body
        delete admins[_admin];
    }

    // Change owner address, ideally to a management contract or multisig
    function changeOwner(address payable _owner) external {
        // Requirements
        require(msg.sender == owner);
        // Body
        removeAdmin(owner);
        addAdmin(_owner);
        owner = _owner;
    }

    // Change Token address
    // WARN: call escape first, or escape(token);
    function changeToken(address _token) external {
        // Locals
        uint256 r;
        // Requirements
        require(msg.sender == owner);
        // Body
        // Zero-out allocation and received, send out received tokens before token switch.
        for (uint256 i = 0; i < registry.length; i++) {
                Contributor storage c = contributors[registry[i]];
                r =  c.received;
                c.received = 0;
                c.allocation = 0;
                // WARN: Should totalReceived and totalForfeited be zeroed-out? 
                ERC20Token(token).transferFrom(address(this), c.addr, r);
        }
        lastForfeit = block.timestamp;
        token = _token;
    }

    // Failsafe, Owner can escape hatch all Tokens and ETH from Contract.
    function escape() public {
        // Requirements
        require(msg.sender == owner);
        // Body
        ERC20Token(token).transferFrom(address(this), owner,  ERC20Token(token).balanceOf(address(this)));
        address(owner).transfer(address(this).balance);
    }

    // Overloaded failsafe function, recourse incase changeToken is called before escape and funds are in a different token
    // Don't want to require in changeToken incase bad behaviour of ERC20 token
    function escape(address _token) external {
        // Requirements
        require(msg.sender == owner);
        // Body
        ERC20Token(_token).transferFrom(address(this), owner,  ERC20Token(_token).balanceOf(address(this)));
        escape();
    }

    // Set Token address and initial maxContributors
    constructor(address _token, uint256 _maxContributors) public {
        // Body
        owner = msg.sender;
        addAdmin(owner);
        lastForfeit = block.timestamp;
        token = _token;
        maxContributors= _maxContributors;
    }

    // function() public { throw; } // TODO Probably not needed?
}