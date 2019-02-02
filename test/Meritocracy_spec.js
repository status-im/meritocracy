/*global contract, config, it, assert*/
const Meritocracy = require('Embark/contracts/Meritocracy');
// const StandardToken = require('Embark/contracts/StandardToken');
const SNT = require('Embark/contracts/SNT');

let accounts;

// For documentation please see https://embark.status.im/docs/contracts_testing.html
config({
  //deployment: {
  //  accounts: [
  //    // you can configure custom accounts with a custom balance
  //    // see https://embark.status.im/docs/contracts_testing.html#Configuring-accounts
  //  ]
  //},
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
      "args": ["$SNT", 100]
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts
});

contract("Meritocracy", function () {
  this.timeout(0);

  // it("should set constructor value", async function () {
  //   let result = await Meritocracy.methods.storedData().call();
  //   assert.strictEqual(parseInt(result, 10), 100);
  // });

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
