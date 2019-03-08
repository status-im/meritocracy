/*global web3*/

import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Grid, Row, Col } from 'react-bootstrap';
import * as NumericInput from 'react-numeric-input';
import Select from 'react-select';

import EmbarkJS from 'Embark/EmbarkJS';

import Meritocracy from 'Embark/contracts/Meritocracy';

// import './css/dapp.css';

/*
TODO:
- list praise for contributor
- listen to events to update UI, (initially on page load but within function calls)
- error handling
*/

// Todo Resolve ENS entries
const options = [
{ 'label' : 'Jarrad (Test)', 'value' : '0x061b0227116e76025D5573cFbb1Ac854916286Fe' },
{ 'label' : 'Andreas S.', 'value' : '0x4923121411e884a4af66ec025712eba600a782d3' }, 
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
//{ 'label' : 'jakubgs.eth',  'value' : 'jakubgs.eth'},
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
//{ 'label' : 'André Medeiros', 'value' : 'andremedeiros.eth' }, 
{ 'label' : 'rramos    /   rramos.stateofus.eth', 'value' : '0xc379330ae48716b81d7411813c3250cd89271788' }, 
{ 'label' : 'emizzle', 'value' : '0x91Ef8ef20Adf13E42757a3Ed6Ff2b1249bE15544' }, 
{ 'label' : 'jason.stateofus.eth', 'value' : '0x4636fb2F6D1DC335EA655795064c2092c89148aB' }
];


class App extends React.Component {

  state = {
    error: null,
    selectedContributors: [],
    contributorList: [],
    currentContributor: {
      allocation: 0,
      totalForfeited: 0,
      totalReceived: 0,
      received: 0,
      status: []
    },
    award: 0,
    praise: ''
  }

  constructor(props) {
    super(props);

    this.handleContributorSelection = this.handleContributorSelection.bind(this);
    this.handleAwardChange = this.handleAwardChange.bind(this);
    this.handlePraiseChange = this.handlePraiseChange.bind(this);
    this.awardTokens = this.awardTokens.bind(this);
    this.withdrawTokens = this.withdrawTokens.bind(this);
  }

  componentDidMount() {
    EmbarkJS.onReady(async (err) => {
      // TODO: check for chain
      this.setState({blockchainEnabled: true});
      if (err) {
        return this.setState({error: err.message || err});
      }

      this.getCurrentContributorData();

      this.getContributors();
    });
  }

  handleContributorSelection(_selectedContributors) {
    this.setState({ selectedContributors: _selectedContributors });
  }

  handleAwardChange(_amount) {
    const { currentContributor: {allocation}, selectedContributors} = this.state;
    
    const maxAllocation = allocation / selectedContributors.length;
    const award = (_amount <=  maxAllocation ? _amount : maxAllocation );
    this.setState({award});
  }

  handlePraiseChange(e) {
    this.setState({ praise: e.target.value });
  }

  resetUIFields(){
    this.setState({
      praise: '',
      selectedContributors: [],
      error: '',
      award: 0
    })
  }

  async getCurrentContributorData(){
    const currentContributor = await this.getContributor(web3.eth.defaultAccount);
    this.setState({currentContributor});
  }

  async getContributor(_address) {
    return await Meritocracy.methods.contributors(_address).call();
  }

  async getContributors() {
    const registry = await Meritocracy.methods.getRegistry().call();
    const contributorList = options.map(prepareOptions).filter(x => registry.includes(web3.utils.toChecksumAddress(x.value)));
    this.setState({contributorList});
  }
  
  async awardTokens(e) {
    const {award, selectedContributors, praise} = this.state;

    // TODO some sanity checks
    if(award <= 0) {
      console.log('amount must be more than 0');
      return;
    }

    let addresses = selectedContributors.map(a => a.value);

    let toSend;
    switch(addresses.length) {
      case 0:
        console.log('No Contributor Selected');
        return;
      case 1:
        toSend = Meritocracy.methods.award(addresses[0], award, praise);
        break;
      default:
        toSend = Meritocracy.methods.awardContributors(addresses, award, praise);
        break;
    }

    try {
      const estimatedGas = await toSend.estimateGas({from: web3.eth.defaultAccount});
      const receipt = await toSend.send({from: web3.eth.defaultAccount, gas: estimatedGas + 1000});

      this.getCurrentContributorData();
      this.resetUIFields();
    } catch(e) {
      console.log('tx failed? got enough tokens to award?');
      console.log(e);
    }
  }


  async withdrawTokens(e) {
    const {currentContributor} = this.state;

    if (currentContributor.received == 0) {
      console.log('can only call withdraw when you have tokens');
      return;
    }

    if ( currentContributor.allocation > 0 ) {
      console.log('you must allocate all your tokens');
      return;
    }

    const toSend = Meritocracy.methods.withdraw();

    try {
      const estimatedGas = await toSend.estimateGas({from: web3.eth.defaultAccount});
      const receipt = await toSend.send({from: web3.eth.defaultAccount, gas: estimatedGas + 1000});
      
      this.getCurrentContributorData();
    } catch(e) {
      console.log('tx failed? Did you allocate all your tokens first?');
    }
  }

  render() {
    const { selectedContributors, contributorList, award, currentContributor } = this.state;
        
    if (this.state.error) {
      return (<div>
        <div>Something went wrong connecting to ethereum. Please make sure you have a node running or are using metamask to connect to the ethereum network:</div>
        <div>{this.state.error}</div>
      </div>);
    }

    const maxAllocation = selectedContributors.length ? Math.floor(currentContributor.allocation / selectedContributors.length) : 0;

    return (<div>
      <h3>Status Meritocracy</h3>
     
      <span>Your Total Received Kudos: { currentContributor.totalReceived || 0} SNT</span> <br/>
      <span>Your Total Forfeited Kudos: { currentContributor.totalForfeited || 0} SNT</span> <br/>

      <h4>Award Kudos</h4>
      <Select
          isMulti
          defaultValue={selectedContributors}
          onChange={this.handleContributorSelection}
          options={contributorList}
          placeholder="Choose Contributor(s)..."
        />
      <span>Your Allocatable Kudos: { currentContributor.allocation } SNT</span> <br/>


      <br/>
      <NumericInput mobile step={5} min={0} max={maxAllocation} onChange={this.handleAwardChange} defaultValue={award} />  <br/>

      <input placeholder="Enter your praise..." onChange={this.handlePraiseChange}/>  <br/>
      <span> Total Awarding: {award * selectedContributors.length} SNT </span>   <br/>
      <Button variant="outline-primary" onClick={this.awardTokens}>Award</Button>


      <h4>Your Kudos History</h4>
      <span>Your Received Kudos: <b>{ currentContributor.received } SNT</b> <Button variant="outline-primary"  onClick={this.withdrawTokens}>Withdraw</Button></span>  <br/>
      <Grid>
        <Row>
          <Col>0x00 has sent you 500 SNT "keep up the good work"</Col>
        </Row>
      </Grid>
        
    </div>);
  }
}


// === Utils ===============================================

const prepareOptions = option => {
  if(option.value.match(/^0x[0-9A-Za-z]{40}$/)){ // Address
    option.value = web3.utils.toChecksumAddress(option.value);
  } else { // ENS Name
    // TODO: resolve ENS names
    // EmbarkJS.Names.resolve("ethereum.eth").then(address => {
    // console.log("the address for ethereum.eth is: " + address);
    //
  }
  return option;
}


ReactDOM.render(<App></App>, document.getElementById('app'));