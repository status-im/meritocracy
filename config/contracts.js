const options = require("../app/js/contributors");
let secret = {};
try {
  secret = require('../.secret.json');
} catch(err) {
  console.dir("warning: .secret.json file not found; this is only needed to deploy to testnet or livenet etc..");
}

function getContributors () {
   var addresses = options.map(a => a.value);
   if ( new Set(addresses).size !==  addresses.length ) {
      throw 'duplicates in options';
   }
   return addresses;
}

const OG_IPFS_HASH = '0x516d5968703543324c75646d45333239436d41594671625767733869577036625177396355714576544742356163';

module.exports = {
  // default applies to all environments
  default: {
    // Blockchain node to deploy the contracts
    deployment: {
      host: "localhost", // Host of the blockchain node
      port: 8546, // Port of the blockchain node
      type: "ws" // Type of connection (ws or rpc),
      // Accounts to use instead of the default account to populate your wallet
      // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
      /*,accounts: [
        {
          privateKey: "your_private_key",
          balance: "5 ether"  // You can set the balance of the account in the dev environment
                              // Balances are in Wei, but you can specify the unit with its name
        },
        {
          privateKeyFile: "path/to/file", // Either a keystore or a list of keys, separated by , or ;
          password: "passwordForTheKeystore" // Needed to decrypt the keystore file
        },
        {
          mnemonic: "12 word mnemonic",
          addressIndex: "0", // Optionnal. The index to start getting the address
          numAddresses: "1", // Optionnal. The number of addresses to get
          hdpath: "m/44'/60'/0'/0/" // Optionnal. HD derivation path
        },
        {
          "nodeAccounts": true // Uses the Ethereum node's accounts
        }
      ]*/
    },
    // order of connections the dapp should connect to
    dappConnection: [
      "$WEB3",  // uses pre existing web3 object if available (e.g in Mist)
      "ws://localhost:8546",
      "http://localhost:8545"
    ],

    // Automatically call `ethereum.enable` if true.
    // If false, the following code must run before sending any transaction: `await EmbarkJS.enableEthereum();`
    // Default value is true.
    // dappAutoEnable: true,

    gas: "auto",

    // Strategy for the deployment of the contracts:
    // - implicit will try to deploy all the contracts located inside the contracts directory
    //            or the directory configured for the location of the contracts. This is default one
    //            when not specified
    // - explicit will only attempt to deploy the contracts that are explicity specified inside the
    //            contracts section.
    //strategy: 'implicit',

    strategy: 'explicit',

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
        "args": ["$SNT", 66, OG_IPFS_HASH]
      }
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    dappConnection: [
      "$WEB3",  // uses pre existing web3 object if available (e.g in Mist)
      "ws://localhost:8546",
      "http://localhost:8545",
    ],
    deployment: {
      // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
      accounts: [
        {
          nodeAccounts: true
        },
        {
          mnemonic: "foster gesture flock merge beach plate dish view friend leave drink valley shield list enemy",
          balance: "5 ether",
          numAddresses: "10"
        }
      ]
    },
    afterDeploy: async (deps) => {
      try {
        const {SNT, Meritocracy} = deps.contracts;

        const addresses = await deps.web3.eth.getAccounts();
        const mainAccount = addresses[0];
        const balance = await SNT.methods.balanceOf(mainAccount).call();
        if (balance !== '0') {
          return;
        }
        const tokens = '1000000000000000000000';

        console.log('Generating tokens for the main account...');
        const generateTokens = SNT.methods.generateTokens(mainAccount, tokens);
        let gas = await generateTokens.estimateGas({from: mainAccount});
        await generateTokens.send({from: mainAccount, gas});

        // Add All Contributors
        console.log('Adding all tokens...');
        const contributors = getContributors();
        contributors.push(mainAccount);
        const addContributors = Meritocracy.methods.addContributors(contributors, OG_IPFS_HASH);
        gas = await addContributors.estimateGas({from: mainAccount});
        await addContributors.send({from: mainAccount, gas});

        // Allocate Owner Tokens
        console.log('Approving token transfer...');
        const approve = SNT.methods.approve(Meritocracy.options.address, tokens);
        gas = await approve.estimateGas({from: mainAccount});
        await approve.send({from: mainAccount, gas});

        console.log('Allocating tokens...');
        const allocate = Meritocracy.methods.allocate(tokens);
        gas = await allocate.estimateGas({from: mainAccount});
        await allocate.send({from: mainAccount, gas});

        console.log('All done!')
      } catch (e) {
        console.log("------- Error in after deploy ------- ");
        console.dir(e);
      }
    }
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {
  },

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {
    contracts: {
      "MiniMeToken": { "deploy": false },
      "MiniMeTokenFactory": {
        "address": "0x6bfa86a71a7dbc68566d5c741f416e3009804279"
      },
      "SNT": {
        "address": "0xc55cF4B03948D7EBc8b9E8BAD92643703811d162"
      },
      "Meritocracy": {
        "address": "0xcde3ca6c59f0316e9c041ee170087d660d35518d"
      }
    },
    deployment: {
      accounts: [{
        mnemonic: "your ropsten mnemonic here",
        numAddresses: "10"
      }]
    },
    "afterDeploy": [
      // Add All Contributors
    //  "Meritocracy.methods.addContributors([" + getContributors().toString() + "]).send()",
    ]
  },

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {
    contracts: {
      "MiniMeToken": { "deploy": false },
      "MiniMeTokenFactory": {
        "address": "0xa1c957c0210397d2d0296341627b74411756d476"
      },
      "SNT": {
        "address": "0x744d70fdbe2ba4cf95131626614a1763df805b9e"
      },
      "Meritocracy": {
        "address": "0x0c869a3f3e915b49727669b5ea28c2efdf9a0a66"
      }
    },
    deployment: {
      accounts: [
        {
          mnemonic: secret.mnemonic,
          hdpath: secret.hdpath || "m/44'/60'/0'/0/",
          numAddresses: "10"
        }
      ],
      host: `mainnet.infura.io/${secret.infuraKey}`,
      port: false,
      protocol: 'https',
      type: "rpc"
    },
    "afterDeploy": [
      // Add All Contributors
    //  "Meritocracy.methods.addContributors([" + getContributors().toString() + "]).send()",
    ]
  },

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
};
