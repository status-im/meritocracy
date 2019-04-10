/*global web3*/
import Meritocracy from 'Embark/contracts/Meritocracy';
import EmbarkJS from 'Embark/EmbarkJS';

const mainAccount = web3.eth.defaultAccount;

export function addContributor(name, address) {
  return new Promise(async (resolve, reject) => {
    try {
      const list = await getContributorList();
      list.push({label: name, value: address});

      const newHash = await saveContributorList(list);

      const addContributor = Meritocracy.methods.addContributor(address, newHash);
      let gas = await addContributor.estimateGas({from: mainAccount});
      const receipt = await addContributor.send({from: mainAccount, gas: gas + 1000});

      resolve(receipt);
    } catch (e) {
      const message = 'Error adding contributor';
      console.error(message);
      console.error(e);
      reject(message);
    }
  });
}

export function getContributorList(hash) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!hash) {
        hash = await Meritocracy.methods.contributorListIPFSHash().call();
      }

      const content = await EmbarkJS.Storage.get(hash);
      const data = JSON.parse(content);
      resolve(data);
    } catch (e) {
      const message = 'Error getting contributor file on IPFS';
      console.error(message);
      console.error(e);
      reject(message);
    }
  });
}

export function saveContributorList(list) {
  return new Promise(async (resolve, reject) => {
    try {
      const newHash = await EmbarkJS.Storage.saveText(JSON.stringify(list));
      resolve(newHash);
    } catch (e) {
      const message = 'Error saving contributor file on IPFS';
      console.error(message);
      console.error(e);
      reject(message);
    }
  });
}

