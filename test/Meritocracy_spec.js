/*global contract, config, it, assert*/
const Meritocracy = require('Embark/contracts/Meritocracy');
// const StandardToken = require('Embark/contracts/StandardToken');
const SNT = require('Embark/contracts/SNT');

let accounts;
let owner;
let admins;
let ownerInitTokens;

const IPFS_HASH = web3.utils.toHex('QmREHBNWoJCx8KDz7PBAThv8mrxGRWimbzqZsL8aDzfLHW');

// For documentation please see https://embark.status.im/docs/contracts_testing.html
config({
  deployment: {
    accounts: [
      {
        "mnemonic": "example exile argue silk regular smile grass bomb merge arm assist farm",
        "balance": "5 ether",
        numAddresses: 10
      }
      // you can configure custom accounts with a custom balance
      // see https://embark.status.im/docs/contracts_testing.html#Configuring-accounts
    ]
  },
  contracts: {
    "MiniMeToken": {"deploy": false, "args": []},
    "MiniMeTokenFactory": {},
    "SNT": {
      "instanceOf": "MiniMeToken",
      "args": [
        "$MiniMeTokenFactory",
        "0x0000000000000000000000000000000000000000",
        0,
        "TestMiniMeToken",
        18,
        "STT",
        true
      ]
    },
    "Meritocracy": {
      "fromIndex": 0, // accounts[0]
      "args": ["$SNT", 10, IPFS_HASH] // Bind to SNT Contract, max 10 contributors.
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
  owner = accounts[0];
  admins = [accounts[0], accounts[1], accounts[2]];
  ownerInitTokens = 10000;
});

contract("Meritocracy", function () {

  before(async () => {
    await SNT.methods.generateTokens(owner, ownerInitTokens).send();
  });

  // Owner Tests

  it("owned == owner, maxContributors == 10", async function () {
    var result;
    result = await Meritocracy.methods.owner().call();
    assert.strictEqual(result, owner);

    result = await Meritocracy.methods.maxContributors().call();
    assert.strictEqual(parseInt(result), 10);

  });

  it("registry.length == 3, allocate(1000);", async function () {
    var result;
    let allocationAmount = 1000;
    let contributorCount = 3;
    let individualAllocation = parseInt(allocationAmount / contributorCount); // 333

    // Add 3 Contributors and check registry length matches
    var i = 0;
    while (i < contributorCount) {
      result = await Meritocracy.methods.addContributor(accounts[i], IPFS_HASH).send({from: owner});
      i++;
    }
    let registry = await Meritocracy.methods.getRegistry().call(); // TODO check if this works
    assert.strictEqual(parseInt(registry.length), contributorCount); // 3

    // Approve and allocate 1000 SNT for Meritocracy use
    result = await SNT.methods.approve(Meritocracy.options.address, allocationAmount).send({from: owner});
    result = await Meritocracy.methods.allocate(allocationAmount).send({from: owner});

    // FIXME these don't work. Looks like the allocation doesn't go through
    result = await SNT.methods.balanceOf(Meritocracy.address).call();
    // assert.strictEqual(parseInt(result), allocationAmount); // 1000

    result = await SNT.methods.balanceOf(owner).call();
    // assert.strictEqual(parseInt(result), ownerInitTokens - allocationAmount); // 9000

    // Check Individual Contributor amount is 333
    const contributor = await Meritocracy.methods.contributors(admins[0]).call();
    // assert.strictEqual(parseInt(contributor.allocation), individualAllocation); // 333
});

  // TODO Addadmin
  // TODO RemoveAdmin

  it("maxContributor + 1 fails", async function() {
    // TODO change so admin adds them
    var result;
    let contributorCount = 3;
    let additionalContributorsToMax = 7;
    var i = 0;
    while (i < additionalContributorsToMax) {
      result = await Meritocracy.methods.addContributor(accounts[contributorCount + i], IPFS_HASH).send({from: owner});
      i++;
    }
    try {
      result = await Meritocracy.methods.addContributor(accounts[i], IPFS_HASH).send({from: owner});
      assert.fail('should have reverted');
    } catch (error) {
      assert.strictEqual(error.message, "VM Exception while processing transaction: revert");
    }
  });

  describe('removeContributor', () => {
    it('removes with normal values', async () => {
      let oldRegistry = await Meritocracy.methods.getRegistry().call();

      let result = await Meritocracy.methods.removeContributor(1, IPFS_HASH).send({from: owner});

      let registry = await Meritocracy.methods.getRegistry().call();

      assert.strictEqual(registry.length, oldRegistry.length - 1);
    })
  })

  // TODO award
  // TODO withdraw before and after

  // TODO forfeitAllocations

  // TODO withdraw after forfeitAllocations

 // TODO setMaxContributors smaller than max
 // TODO setMaxContributors again
 // TODO addContributors
 // TODO changeOwner

 // TODO escape
 // TODO changeToken
  // TODO escape overload?
});
