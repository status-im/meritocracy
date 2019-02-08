/*global contract, config, it, assert*/
const Meritocracy = require('Embark/contracts/Meritocracy');
// const StandardToken = require('Embark/contracts/StandardToken');
const SNT = require('Embark/contracts/SNT');

let accounts;
let owner;
let admins;

// For documentation please see https://embark.status.im/docs/contracts_testing.html
config({
  deployment: {
   accounts: [
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
          {  "mnemonic": "12 word mnemonic", "balance": "5 ether"  },
     // you can configure custom accounts with a custom balance
     // see https://embark.status.im/docs/contracts_testing.html#Configuring-accounts
   ]
  },
  contracts: {
    "MiniMeToken": { "deploy": false, "args" : [] },
    "MiniMeTokenFactory": { },
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
      "args": ["$SNT", 10] // Bind to SNT Contract, max 10 contributors.
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
  owner = accounts[0];
  admins = [accounts[0], accounts[1], accounts[2]];
  ownerInitTokens = 10000;
});

contract("Meritocracy", function () {
  this.timeout(0);

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

  it("registryLength == 3, allocate(1000);", async function () {
    var result;
    let allocationAmount = 1000;
    let contributorCount = 3;
    let individualAllocation = parseInt(allocationAmount / contributorCount); // 333

    // Add 3 Contibutors and check registry length matches
    var i = 0;
    while(i<contributorCount ){
      result = await Meritocracy.methods.addContributor(accounts[i]).send({from: owner});
      i++;
    }
    let registryLength = await Meritocracy.methods.registryLength().call();
    assert.strictEqual(parseInt(registryLength), contributorCount); // 3

    // Approve and allocate 1000 SNT for Meritocracy use
    result = await SNT.methods.approve(Meritocracy.address, allocationAmount).send({from: owner});
    result = await Meritocracy.methods.allocate(allocationAmount).send({from: owner});

    result = await SNT.methods.balanceOf(Meritocracy.address).call();
    assert.strictEqual(parseInt(result), allocationAmount); // 1000

    result = await SNT.methods.balanceOf(owner).call();
    assert.strictEqual(parseInt(result), ownerInitTokens - allocationAmount); // 9000

    // Check Individual Contributor amount is 333
    const contributor = await  Meritocracy.methods.contributors(admins[0]).call();
    assert.strictEqual(parseInt(contributor.allocation), individualAllocation); // 333
});

  it("maxContributor + 1 fails", async function () {
    var result;
    let contributorCount = 3;
    let additionalContributorsToMax = 7;
    var i = 0;
    while(i<additionalContributorsToMax){
      result = await Meritocracy.methods.addContributor(accounts[contributorCount + i]).send({from: owner});
      i++;
    }
    try {
      result = await Meritocracy.methods.addContributor(accounts[i]).send({from: owner});
      assert.fail('should have reverted');
    } catch (error) {
      assert.strictEqual(error.message, "VM Exception while processing transaction: revert");
    }
  });


  // it("set storage value", async function () {
  //   await Meritocracy.methods.set(150).send();
  //   let result = await SimpleStorage.methods.get().call();
  //   assert.strictEqual(parseInt(result, 10), 150);
  // });

  // it("should have account with balance", async function() {
  //   let balance = await web3.eth.getBalance(accounts[0]);
  //   assert.ok(parseInt(balance, 10) > 0);
  // });
});
