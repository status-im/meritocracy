/* global contract, config, it, assert, web3, before, describe, xit */
const Meritocracy = require('Embark/contracts/Meritocracy');
const SNT = require('Embark/contracts/SNT');
const TestUtils = require('../utils/testUtils');

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
    "MiniMeToken": {"deploy": false},
    "MiniMeTokenFactory": {},
    "SNT": {
      "instanceOf": "MiniMeToken",
      "args": [
        "$MiniMeTokenFactory",
        "0x0000000000000000000000000000000000000000",
        0,
        "Status Network Token",
        18,
        "STT",
        true
      ]
    },
    "Meritocracy": {
      "args": ["$SNT", 10, IPFS_HASH] // Bind to SNT Contract, max 10 contributors.
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
  owner = accounts[0];
  admins = [accounts[0], accounts[1], accounts[2]];
  ownerInitTokens = web3.utils.toWei("10000", "ether");
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
    assert.strictEqual(parseInt(result, 10), 10);

  });

  it("registry.length == 3, allocate(1000);", async function () {
    var result;
    let allocationAmount = web3.utils.toWei("1000", "ether"); // 1000 SNT
    let contributorCount = 3;

    // Add 3 Contributors and check registry length matches
    var i = 0;
    while (i < contributorCount) {
      result = await Meritocracy.methods.addContributor(accounts[i], IPFS_HASH).send({from: owner});
      i++;
    }

    let registry = await Meritocracy.methods.getRegistry().call(); // TODO check if this works
    assert.strictEqual(parseInt(registry.length, 10), contributorCount); // 3

    // Approve and allocate 1000 SNT for Meritocracy use
    result = await SNT.methods.approve(Meritocracy.options.address, allocationAmount).send({from: owner});
    result = await Meritocracy.methods.allocate(allocationAmount).send({from: owner});

    // FIXME these don't work. Looks like the allocation doesn't go through
    result = await SNT.methods.balanceOf(Meritocracy.address).call();
    assert.strictEqual(result, web3.utils.toWei("999", "ether")); // 999, because each contributor will receive 333.

    result = await SNT.methods.balanceOf(owner).call();
    assert.strictEqual(result, web3.utils.toBN(ownerInitTokens).sub(web3.utils.toBN(web3.utils.toWei("999", "ether"))).toString()); // 9001

    // Check Individual Contributor amount is 333
    const contributor = await Meritocracy.methods.contributors(admins[0]).call();
    assert.strictEqual(contributor.allocation, web3.utils.toWei("333", "ether"));
  });

  // TODO Addadmin
  // TODO RemoveAdmin
  
  // TODO award
  describe('award', () => {
    it('should be able to award a contributor', async () => {
      await Meritocracy.methods.award(accounts[0], web3.utils.toWei("25", "ether"), "ABC").send({from: accounts[2]});

      const sender = await Meritocracy.methods.contributors(accounts[2]).call();
      assert.strictEqual(sender.allocation, web3.utils.toBN(web3.utils.toWei("333", "ether")).sub(web3.utils.toBN(web3.utils.toWei("25", "ether"))).toString());
    
      await Meritocracy.methods.award(accounts[1], web3.utils.toWei("25", "ether"), "ABC").send({from: accounts[2]});    
    });

    xit('should fail if awarded contributor does not exist', async () => {
      // TODO: 
    });

    xit('only contributors can do awards', async () => {
      // TODO:
    });
  });

  describe('withdraw', () => {
    it('cannot withdraw if user has allocation', async () => {
      try {
        await Meritocracy.methods.withdraw().send({from: accounts[0]});
        assert.fail('should have reverted');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert Allocation needs to be awarded or forfeited");
      }
    });

    it('can withdraw if allocation is 0', async () => {
      const balanceBefore = await SNT.methods.balanceOf(accounts[0]).call();
      const contributor = await Meritocracy.methods.contributors(accounts[0]).call();

      await Meritocracy.methods.award(accounts[2], web3.utils.toWei("333", "ether"), "ABC").send({from: accounts[0]});
      await Meritocracy.methods.withdraw().send({from: accounts[0]});

      const balanceAfter = await SNT.methods.balanceOf(accounts[0]).call();

      assert(web3.utils.toBN(balanceAfter).gt(web3.utils.toBN(balanceBefore)))
      assert.strictEqual(balanceAfter, web3.utils.toBN(balanceBefore).add(web3.utils.toBN(contributor.received)).toString());
    });
  });

  describe('forfeitAllocations', () => {
    // TODO: add test cases
    let amountToForfeit = 0;
    let forfeitedBalance = 0;

    it("should forfeit allocations", async () => {

      const b1 = web3.utils.toBN((await Meritocracy.methods.contributors(accounts[0]).call()).allocation);
      const b2 = web3.utils.toBN((await Meritocracy.methods.contributors(accounts[1]).call()).allocation);
      const b3 = web3.utils.toBN((await Meritocracy.methods.contributors(accounts[2]).call()).allocation);

      amountToForfeit = b1.add(b2.add(b3));
      
      TestUtils.increaseTime(86400 * 8);

      await Meritocracy.methods.forfeitAllocations().send({from: accounts[0]});
    });

    it("Forfeited balance should increase", async () => {
      forfeitedBalance = await Meritocracy.methods.SNTforfeitedBalance().call();
      assert(forfeitedBalance !== "0");
      assert.strictEqual(forfeitedBalance, amountToForfeit.toString());
    });

    it("Balances should be correct after forfeiting the allocations", async () => {
      const c1 = await Meritocracy.methods.contributors(accounts[0]).call();
      const c2 = await Meritocracy.methods.contributors(accounts[1]).call();
      const c3 = await Meritocracy.methods.contributors(accounts[2]).call();

      const b1 = web3.utils.toBN(c1.allocation).add(web3.utils.toBN(c1.received));
      const b2 = web3.utils.toBN(c2.allocation).add(web3.utils.toBN(c2.received));
      const b3 = web3.utils.toBN(c3.allocation).add(web3.utils.toBN(c3.received));

      const correctContractBalance = web3.utils.toBN(forfeitedBalance).add(b1.add(b2.add(b3)));
      const contractBalance = await SNT.methods.balanceOf(Meritocracy.options.address).call();

      assert.strictEqual(correctContractBalance.toString(), contractBalance);
    });
  });

  // TODO withdraw after forfeitAllocations

  describe('allocate 2nd cycle', () => {

    before(async () => {
      // Reset approval
      await SNT.methods.approve(Meritocracy.options.address, "0").send({from: owner});
    });

    it("should allocate new funds", async () => {
      const allocationAmount = web3.utils.toWei("300", "ether"); // 300 SNT
      await SNT.methods.approve(Meritocracy.options.address, allocationAmount).send({from: owner});
      
      await Meritocracy.methods.allocate(allocationAmount).send({from: owner});
    });

    it("contract balance should be equivalent to new allocation (with prev forfeited balance), and received for each contributor", async () => {
      const contractBalance = await SNT.methods.balanceOf(Meritocracy.options.address).call();

      const c1 = await Meritocracy.methods.contributors(accounts[0]).call();
      const c2 = await Meritocracy.methods.contributors(accounts[1]).call();
      const c3 = await Meritocracy.methods.contributors(accounts[2]).call();

      const b1 = web3.utils.toBN(c1.allocation).add(web3.utils.toBN(c1.received));
      const b2 = web3.utils.toBN(c2.allocation).add(web3.utils.toBN(c2.received));
      const b3 = web3.utils.toBN(c3.allocation).add(web3.utils.toBN(c3.received));

      const forfeitedBalance = web3.utils.toBN(await Meritocracy.methods.SNTforfeitedBalance().call());

      const correctContractBalance = forfeitedBalance.add(b1.add(b2.add(b3)));
      assert.strictEqual(contractBalance, correctContractBalance.toString());
    });
  });

  describe('removeContributor', () => {
    let initialForfeitBalance = 0;
    let balanceToForfeit = 0;
    let contribBalance = 0;
    let contribReceived = 0;

    before(async () => {
      initialForfeitBalance = web3.utils.toBN(await Meritocracy.methods.SNTforfeitedBalance().call());
      const contributor = await Meritocracy.methods.contributors(accounts[1]).call();
      balanceToForfeit = web3.utils.toBN(contributor.allocation);
      contribReceived = web3.utils.toBN(contributor.received);
      contribBalance = web3.utils.toBN(await SNT.methods.balanceOf(accounts[1]).call());
    });

    it('removes with normal values', async () => {
      let oldRegistry = await Meritocracy.methods.getRegistry().call();
      await Meritocracy.methods.removeContributor(1, IPFS_HASH).send({from: owner});
      let registry = await Meritocracy.methods.getRegistry().call();
      assert.strictEqual(registry.length, oldRegistry.length - 1);
    });

    it("contributor should have received their SNT", async () => {
      assert(contribReceived !== '0');

      const currBalance = await SNT.methods.balanceOf(accounts[1]).call();
      assert.strictEqual(currBalance, contribBalance.add(contribReceived).toString());
    });

    it("contributor data should be removed", async() => {
      const contributor = await Meritocracy.methods.contributors(accounts[1]).call();
      assert.strictEqual(TestUtils.zeroAddress, contributor.addr);
    });

    it("forfeited balance should have increased using deleted contributor allocation", async () => {
      const forfeitedBalance = await Meritocracy.methods.SNTforfeitedBalance().call();
      assert.strictEqual(forfeitedBalance, initialForfeitBalance.add(balanceToForfeit).toString());
    });
  });

  describe('other conditions', async () => {
    it("maxContributor + 1 fails", async function() {
      // TODO change so admin adds them
      let contributorCount = 3;
      let additionalContributorsToMax = 7;
      var i = 0;
      while (i < additionalContributorsToMax) {
        await Meritocracy.methods.addContributor(accounts[contributorCount + i], IPFS_HASH).send({from: owner});
        i++;
      }
      try {
        await Meritocracy.methods.addContributor(accounts[i], IPFS_HASH).send({from: owner});
        assert.fail('should have reverted');
      } catch (error) {
        assert.strictEqual(error.message, "VM Exception while processing transaction: revert");
      }
    });
  });

  // TODO setMaxContributors smaller than max
  // TODO setMaxContributors again
  // TODO addContributors
  // TODO changeOwner

  // TODO escape
  // TODO changeToken
  // TODO escape overload?
});
