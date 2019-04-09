import Meritocracy from 'Embark/contracts/Meritocracy';
import EmbarkJS from 'Embark/EmbarkJS';
import axios from 'axios';

const IPFS_HASH = 'QmfWJJYFBJReu2rzTDzkBKXHazE52GVWrTcVNKdcupnxNH';

export function addContributor(name, address) {
  Meritocracy.methods.addContributor(address)
}

export function getContributorList() {
  return new Promise(async (resolve, reject) => {
    try {
      const url = EmbarkJS.Storage.getUrl(IPFS_HASH);
      console.log('Url', url);
      const response = await axios.get(url);
      console.log(response.data);
      resolve(response.data.contributors);
    } catch (e) {
      const message = 'Error getting contributor file on IPFS';
      console.error(message);
      console.error(e);
      reject(message);
    }
  });
}
