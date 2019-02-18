// this is also defined in index.js
const options = [
{ 'label' : 'Jarrad (Test)', 'value' : '0x061b0227116e76025D5573cFbb1Ac854916286Fe' },
{ 'label' : 'Andreas S.', 'value' : '0x4923121411e884a4af66ec025712eba600a782d3' },  // commented because I already added to blockchain
{ 'label' : 'andrey.dev', 'value' : '0xA4EcA293cb578a68b190e3e07c2B170dc753fe44' }, 
{ 'label' : 'barry', 'value' : '0xa46b0546481a04b7de049a8a20f8a9b2b2c5cc05' }, 
{ 'label' : 'BrianXV', 'value' : '0x03b832b3fa819d7a4b6c819e4df1e60a173e739a' }, 
{ 'label' : 'ceri', 'value' : '0x68f47e153e1aa7d6529e078feff86eada87ddee3' }, 
{ 'label' : 'Dani', 'value' : '0x89c010bc7085eb150b66582f13681f9e36904bea' }, 
{ 'label' : 'dmitryn', 'value' : '0x6b0d7ba67aa3d84122749dc7906b8e7f25ed1af8' }, 
{ 'label' : 'gravityblast', 'value' : '0xb5a2c17c7fd72070fcf078bb8458f2f595441066' }, 
{ 'label' : 'guylouis.stateofus.eth', 'value' : '0x6913f3bdbb7c303977d6244c0e0071b4ebc6f359' }, 
{ 'label' : 'Hester', 'value' : '0x8c4f71b3cf6a76de2cc239a6fa84e1a80e589598' }, 
{ 'label' : 'Hutch', 'value' : '0x34a4b73100d11815ee4bb0ebcc86ba5824b12134' }, 
{ 'label' : 'igor.stateofus.eth', 'value' : '0x6a069D627BAA9a627D79D2097EC979E2c58F1984' }, 
// { 'label' : 'jakubgs.eth',  'value' : 'jakubgs.eth'}, // commented because ens resolving
{ 'label' : 'Jinho', 'value' : '0x7407bF49004ee99d9B2caA2fb90B476bfF2DbCaf' }, 
{ 'label' : 'Jonathan Barker', 'value' : '0xf23d05F375A8367b150f7Ad1A37DFd9E3c35eE56' }, 
{ 'label' : 'Jonathan Rainville', 'value' : '0x9ce0056c5fc6bb9459a4dcfa35eaad8c1fee5ce9' }, 
{ 'label' : 'Jonny Z', 'value' : '0xa40b07ac80d1f89b233b74e78d254c90906c33ee' }, 
{ 'label' : 'Julien', 'value' : '0x6c618ddbf53aa9540c279e3670d4d26fb367fd4e' }, 
{ 'label' : 'Maciej', 'value' : '0x227612e69b1d06250e7035c1c12840561ebf3c56' }, 
{ 'label' : 'michele', 'value' : '0x658a1d2c105b35d9aaad38480dbbfe47b9054962' }, 
{ 'label' : 'Nabil', 'value' : '0x528c9e62bb0e7083f4b42802297b38ba237776a0' }, 
{ 'label' : 'Oskar', 'value' : '0x3fd6e2dfa535ce8b1e7eb7116a009eba3890b6bd' }, 
{ 'label' : 'PascalPrecht', 'value' : '0x6f490165DdD8d604b52dB9D9BF9b63aE997DC11C' }, 
{ 'label' : 'pedro.stateofus.eth', 'value' : '0x78EA50b13de394671474314aA261556717bF9185' }, 
{ 'label' : 'Rachel', 'value' : '0x4b9ba5B0dEE90f5B84Bcbfbf921cF02e1C8da113' }, 
{ 'label' : 'Rajanie', 'value' : '0x8af0d6fabc4a90ea0b95f80ab62beb816ed32a69' }, 
{ 'label' : 'Ricardo Schmidt <3esmit>', 'value' : '0x3D597789ea16054a084ac84ce87F50df9198F415' }, 
{ 'label' : 'Sergey', 'value' : '0xb9f914fe1c6edae2351fb42276868470083a3cd2' }, 
{ 'label' : 'shemnon', 'value' : '0x82ad1b2419fd71dfe2d5db9b3c832c60ec96c53b' }, 
{ 'label' : 'sonja.stateofus.eth', 'value' : '0xCF03738e9605C0B38cEAa7349bF6926463f01A25' }, 
{ 'label' : 'Swader', 'value' : '0x9702797d92e2a06070b446e49a594a943686e28f' }, 
{ 'label' : 'yenda', 'value' : '0xe829f7947175fe6a338344e70aa770a8c134372c' }, 
{ 'label' : 'petty', 'value' : '0x2942577508e060ea092c0CD7802ae42c1CEA2BAe' }, 
{ 'label' : 'chu', 'value' : '0xd21DB0e43048AcB94f428eD61dC244c82f1ff2a8' }, 
{ 'label' : 'Yessin', 'value' : '0xbaba92b7822a56c05554ab5d1bc1d0b7e212499d' }, 
{ 'label' : 'michaelb', 'value' : '0xdba0bade45727776bbb0d93176ee1ddba830f319' }, 
{ 'label' : 'cryptowanderer', 'value' : '0x406abd306b633b6460666b4092784a3330370c7b' }, 
{ 'label' : 'adam.stateofus.eth', 'value' : '0x074032269ca1775896c92304d45f80b5a67a5bcb' }, 
// { 'label' : 'André Medeiros', 'value' : 'andre medeiros.eth' }, 
{ 'label' : 'rramos    /   rramos.stateofus.eth', 'value' : '0xc379330ae48716b81d7411813c3250cd89271788' }, 
{ 'label' : 'emizzle', 'value' : '0x91Ef8ef20Adf13E42757a3Ed6Ff2b1249bE15544' }, 
{ 'label' : 'jason.stateofus.eth', 'value' : '0x4636fb2F6D1DC335EA655795064c2092c89148aB' }
];

function getContributors () {
   var addresses = options.map(a => "'"+ a.value + "'");
   if ( new Set(addresses).size !==  addresses.length ) {
      throw 'duplicates in options';
   }
   return addresses;
}


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
        "fromIndex": 0,
        "args": [ "$SNT", 66]
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
    "afterDeploy": [
      // Give Tokens to Meritocracy Owner
      "SNT.methods.generateTokens('$accounts[0]', '100000000000000000000').send()",
      // Add All Contributors
      "Meritocracy.methods.addContributors([" + getContributors().toString() + "]).send()",
      // Allocate Owner Tokens
      "SNT.methods.approve('$Meritocracy', 10000).send()",
      "Meritocracy.methods.allocate(10000).send()"

    ]

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