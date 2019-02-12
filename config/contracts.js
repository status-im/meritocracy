module.exports = {
  // default applies to all environments
  default: {
    // Blockchain node to deploy the contracts
    deployment: {
      host: "localhost", // Host of the blockchain node
      port: 8545, // Port of the blockchain node
      type: "rpc", // Type of connection (ws or rpc),
      // Accounts to use instead of the default account to populate your wallet
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
          ]
    },
    // order of connections the dapp should connect to
    dappConnection: [
      "$WEB3",  // uses pre existing web3 object if available (e.g in Mist)
      "ws://localhost:8546",
      "http://localhost:8545"
    ],
    gas: "auto",
    contracts: {
      "MiniMeToken": { "deploy": false },
      "MiniMeTokenFactory": {

      },
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
        "args": [ "$SNT", 66]
      }
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    dappConnection: [
      "ws://localhost:8546",
      "http://localhost:8545",
      "$WEB3"  // uses pre existing web3 object if available (e.g in Mist)
    ],
    deployment: {
      // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
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
          ]
    },
    "afterDeploy": ["SNT.methods.generateTokens('$accounts[0]', '100000000000000000000').send()"]
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {
  },

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {
  },

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {
  },

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
};
