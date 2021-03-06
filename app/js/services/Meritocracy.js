/*global web3*/
import Meritocracy from 'Embark/contracts/Meritocracy';
import SNT from 'Embark/contracts/SNT';

import EmbarkJS from 'Embark/EmbarkJS';

let contributorList;

export function addContributor(name, address) {
  return new Promise(async (resolve, reject) => {
    const mainAccount = web3.eth.defaultAccount;
    try {
      const list = await getContributorList();
      list.push({ label: name, value: address });

      const newHash = await saveContributorList(list);

      const addContributor = Meritocracy.methods.addContributor(address, web3.utils.toHex(newHash));
      let gas = await addContributor.estimateGas({ from: mainAccount });
      const receipt = await addContributor.send({ from: mainAccount, gas: gas + 1000 });

      resolve(receipt);
    } catch (error) {
      const message = 'Error adding contributor';
      console.error(message);
      console.error(error);
      reject(message);
    }
  });
}

export function removeContributor(address) {
  return new Promise(async (resolve, reject) => {
    const mainAccount = web3.eth.defaultAccount;
    try {
      const registry = await Meritocracy.methods.getRegistry().call({ from: mainAccount });
      let index = registry.indexOf(address);

      const list = await getContributorList();
      const idx = list.findIndex(contributor => contributor.value === address);
      list.splice(idx, 1);

      const newHash = await saveContributorList(list);

      const removeContributor = Meritocracy.methods.removeContributor(index, web3.utils.toHex(newHash));
      let gas = await removeContributor.estimateGas({ from: mainAccount });
      const receipt = await removeContributor.send({ from: mainAccount, gas: gas + 1000 });

      resolve(receipt);
    } catch (error) {
      const message = 'Error removing contributor';
      console.error(message);
      console.error(error);
      reject(message);
    }
  });
}

export function getContributorList(hash) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!hash) {
        hash = await Meritocracy.methods.contributorListIPFSHash().call();
        hash = web3.utils.hexToAscii(hash);
      }

      const content = await EmbarkJS.Storage.get(hash);
      contributorList = JSON.parse(content);
      resolve(contributorList);
    } catch (error) {
      const message = 'Error getting contributor file on IPFS';
      console.error(message);
      console.error(error);
      reject(message);
    }
  });
}

export async function getFormattedContributorList(hash) {
  return new Promise(async (resolve, reject) => {
    const mainAccount = web3.eth.defaultAccount;
    try {
      let list = await getContributorList(hash);
      list = list.map(prepareOptions);

      const registry = await Meritocracy.methods.getRegistry().call({ from: mainAccount });
      list = list.filter(contributorData => registry.includes(contributorData.value));

      resolve(list);
    } catch (error) {
      const message = 'Error getting formatted contributor file on IPFS';
      console.error(message);
      console.error(error);
      reject(message);
    }
  });
}

export function forfeitAllocation() {
  return new Promise(async (resolve, reject) => {
    const mainAccount = web3.eth.defaultAccount;
    try {
      const toSend = Meritocracy.methods.forfeitAllocations();
      let gas = await toSend.estimateGas({ from: mainAccount });
      const receipt = await toSend.send({ from: mainAccount, gas: gas + 1000 });
      resolve(receipt);
    } catch (error) {
      const message = 'Error forfeiting allocation';
      console.error(error);
      reject(message);
    }
  });
}

export function getSNTBalance() {
  return new Promise(async (resolve) => {
    const mainAccount = web3.eth.defaultAccount;
    resolve(await SNT.methods.balanceOf(mainAccount).call());
  });
}


export function getAllowance() {
  return new Promise(async (resolve) => {
    const mainAccount = web3.eth.defaultAccount;
    resolve(await SNT.methods.allowance(mainAccount, Meritocracy.options.address).call());
  });
}

export function resetAllowance() {
  return new Promise(async (resolve, reject) => {
    const mainAccount = web3.eth.defaultAccount;
    try {
      const toSend = SNT.methods.approve(Meritocracy.options.address, '0');
      const gas = await toSend.estimateGas({ from: mainAccount });
      const receipt = await toSend.send({ from: mainAccount, gas: gas + 1000 });
      resolve(receipt);
    } catch(error) {
      reject(error);
    }
  });
}

export function approve(sntAmount) {
  return new Promise(async (resolve, reject) => {
    const mainAccount = web3.eth.defaultAccount;
    try {
      const toSend = SNT.methods.approve(Meritocracy.options.address, sntAmount);
      const gas = await toSend.estimateGas({ from: mainAccount });
      const receipt = await toSend.send({ from: mainAccount, gas: gas + 1000 });
      resolve(receipt);
    } catch(error) {
      reject(error);
    }
  });
}

export function allocate(sntAmount) {
  return new Promise(async (resolve, reject) => {
    const mainAccount = web3.eth.defaultAccount;
    try {
      let toSend, gas;
      toSend = Meritocracy.methods.allocate(sntAmount);
      gas = await toSend.estimateGas({ from: mainAccount });
      await toSend.send({ from: mainAccount, gas: gas + 1000 });
      resolve(true);
    } catch (error) {
      let message;

      if (error.message === 'Not enough SNT') {
        message = 'Not enough SNT';
      } else {
        message = 'Error doing allocation';
      }
      console.error(error);
      reject(message);
    }
  });
}

export function lastForfeited() {
  return new Promise(async resolve => {
    const date = await Meritocracy.methods.lastForfeit().call();
    resolve(date);
  });
}

const prepareOptions = option => {
  if (option.value.match(/^0x[0-9A-Za-z]{40}$/)) {
    // Address
    option.value = web3.utils.toChecksumAddress(option.value);
  } else {
    // ENS Name
    // TODO: resolve ENS names
    // EmbarkJS.Names.resolve("ethereum.eth").then(address => {
    // console.log("the address for ethereum.eth is: " + address);
    //
  }
  return option;
};

export async function getCurrentContributorData() {
  const mainAccount = web3.eth.defaultAccount;
  const contribData = await getContributorData(mainAccount);
  return contribData;
}

export async function getContributorData(_address) {
  const currentContributor = await getContributor(_address);

  let praises = [];
  for (let i = 0; i < currentContributor.praiseNum; i++) {
    praises.push(Meritocracy.methods.getStatus(_address, i).call());
  }

  if (!contributorList) {
    await getContributorList();
  }

  const contribData = contributorList.find(x => x.value === _address);
  if (contribData) currentContributor.name = contribData.label;

  currentContributor.praises = await Promise.all(praises);
  currentContributor.allocation = web3.utils.fromWei(currentContributor.allocation, 'ether');
  currentContributor.totalForfeited = web3.utils.fromWei(currentContributor.totalForfeited, 'ether');
  currentContributor.totalReceived = web3.utils.fromWei(currentContributor.totalReceived, 'ether');
  currentContributor.received = web3.utils.fromWei(currentContributor.received, 'ether');

  return currentContributor;
}

export function getAllPraises() {
  return new Promise(function(resolve) {
    let praisesPromises = [];
    let praiseNumPromises = [];
    for (let i = 0; i < contributorList.length; i++) {
      praiseNumPromises.push(Meritocracy.methods.getStatusLength(contributorList[i].value).call());
    }

    Promise.all(praiseNumPromises).then(praiseNums => {
      for (let i = 0; i < contributorList.length; i++) {
        let currPraises = [];
        for (let j = 0; j < praiseNums[i]; j++) {
          currPraises.push(Meritocracy.methods.getStatus(contributorList[i].value, j).call());
        }
        praisesPromises.push(currPraises);
      }

      const allPromises = Promise.all(
        praisesPromises.map(function(innerPromiseArray) {
          return Promise.all(innerPromiseArray);
        })
      );

      allPromises.then(praises => {
        for (let i = 0; i < praises.length; i++) {
          praises[i] = praises[i].map(x => {
            x.destination = contributorList[i].label;
            return x;
          });
        }
        resolve(praises.flat());
      });
    });
  });
}

export async function getContributor(_address) {
  const contributor = await Meritocracy.methods.contributors(_address).call();
  contributor.praiseNum = await Meritocracy.methods.getStatusLength(_address).call();
  return contributor;
}

export function saveContributorList(list) {
  return new Promise(async (resolve, reject) => {
    try {
      contributorList = list;
      const newHash = await EmbarkJS.Storage.saveText(JSON.stringify(list));
      resolve(newHash);
    } catch (error) {
      const message = 'Error saving contributor file on IPFS';
      console.error(message);
      console.error(error);
      reject(message);
    }
  });
}

export function isAdmin(address) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Meritocracy.methods.admins(address).call();
      resolve(result);
    } catch (error) {
      const message = 'Could not get status of user';
      console.error(message);
      console.error(error);
      reject(message);
    }
  });
}
