/*global web3*/
import Meritocracy from 'Embark/contracts/Meritocracy';
import EmbarkJS from 'Embark/EmbarkJS';
import axios from 'axios';

const IPFS_HASH = 'QmfWJJYFBJReu2rzTDzkBKXHazE52GVWrTcVNKdcupnxNH';
const IPNS_HASH = 'QmPW4ZGXXvVYxC7Uez62m9yYZZYVHmo98c8rP6Hu1nb1Na';

const mainAccount = web3.eth.defaultAccount;

export function addContributor(name, address) {
  return new Promise(async (resolve, reject) => {
    try {
      const addContributor = Meritocracy.methods.addContributor(address);
      let gas = await addContributor.estimateGas({from: mainAccount});
      console.log({gas});
      const receipt = await addContributor.send({from: mainAccount, gas: gas + 1000});

      console.log({receipt});

      const list = await getContributorList();
      list.push({label: name, value: address});
      console.log({list});

      await saveContributorList(list);

      resolve();
    } catch (e) {
      const message = 'Error adding contributor';
      console.error(message);
      console.error(e);
      reject(message);
    }
  });
}

export function getContributorList() {
  return new Promise(async (resolve, reject) => {
    try {
      // TODO figure out how to make IPFS/IPNS work
      const hash = await EmbarkJS.Storage.resolve(IPNS_HASH, (err, hash) => {
        console.log('Resolved??', {err, hash});
      });
      console.log({hash});
      const url = await EmbarkJS.Storage.getUrl(hash);
      console.log({url});
      const response = await axios.get(url);
      resolve(response.data.contributors);
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
      const url = await EmbarkJS.Storage.getUrl(IPNS_HASH);
      console.log('Url', url);
      console.log('saving', {contributors: list});
      const response = await axios.post(url, {contributors: list});
      console.log(response.data);
      resolve(response.data.contributors);
    } catch (e) {
      const message = 'Error saving contributor file on IPFS';
      console.error(message);
      console.error(e);
      reject(message);
    }
  });
}
