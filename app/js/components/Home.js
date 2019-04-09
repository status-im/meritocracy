/*global web3*/
import React from 'react';
import {Button, Grid, Row, Col, Alert } from 'react-bootstrap';
import * as NumericInput from 'react-numeric-input';
import Select from 'react-select';

import Meritocracy from 'Embark/contracts/Meritocracy';

// import './css/dapp.css';

/*
TODO:
- list praise for contributor
- listen to events to update UI, (initially on page load but within function calls)
*/

// Todo Resolve ENS entries
import contributors from "../contributors";
let options = contributors;

class Home extends React.Component {

  state = {
    errorMsg: null,
    busy: false,
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
  };

  constructor(props) {
    super(props);

    this.handleContributorSelection = this.handleContributorSelection.bind(this);
    this.handleAwardChange = this.handleAwardChange.bind(this);
    this.handlePraiseChange = this.handlePraiseChange.bind(this);
    this.awardTokens = this.awardTokens.bind(this);
    this.withdrawTokens = this.withdrawTokens.bind(this);
  }

  async componentDidMount() {
    options = options.map(prepareOptions);

    await this.getContributors();

    this.getCurrentContributorData();
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
      errorMsg: '',
      award: 0
    });
  }

  async getCurrentContributorData(){
    const currentContributor = await this.getContributor(web3.eth.defaultAccount);

    let praises = [];
    for(let i = 0; i < currentContributor.praiseNum; i++){
      praises.push(Meritocracy.methods.getStatus(web3.eth.defaultAccount, i).call());
    }

    const contribData = options.find(x => x.value === web3.eth.defaultAccount);
    if(contribData) currentContributor.name = contribData.label;

    currentContributor.praises = await Promise.all(praises);
    currentContributor.allocation = web3.utils.fromWei(currentContributor.allocation, "ether");
    currentContributor.totalForfeited = web3.utils.fromWei(currentContributor.totalForfeited, "ether");
    currentContributor.totalReceived = web3.utils.fromWei(currentContributor.totalReceived, "ether");
    currentContributor.received = web3.utils.fromWei(currentContributor.received, "ether");

    this.setState({currentContributor});
  }

  async getContributor(_address) {
    const contributor = await Meritocracy.methods.contributors(_address).call();
    contributor.praiseNum = await Meritocracy.methods.getStatusLength(_address).call();
    return contributor;
  }

  async getContributors() {
    const registry = await Meritocracy.methods.getRegistry().call({from: web3.eth.defaultAccount});
    const contributorList = options.filter(x => registry.includes(x.value) && x.value !== web3.eth.defaultAccount);
    this.setState({contributorList});
  }

  async awardTokens(e) {
    const {award, selectedContributors, praise} = this.state;

    // TODO some sanity checks
    if(award <= 0) {
      this.setState({errorMsg: 'amount must be more than 0'});
      return;
    }

    let addresses = selectedContributors.map(a => a.value);

    const sntAmount = web3.utils.toWei(award.toString(), "ether");

    let toSend;
    switch(addresses.length) {
      case 0:
        this.setState({errorMsg: 'No Contributor Selected'});
        return;
      case 1:
        toSend = Meritocracy.methods.award(addresses[0], sntAmount, praise);
        break;
      default:
        toSend = Meritocracy.methods.awardContributors(addresses, sntAmount, praise);
        break;
    }

    try {
      this.setState({busy: true});

      const estimatedGas = await toSend.estimateGas({from: web3.eth.defaultAccount});
      const receipt = await toSend.send({from: web3.eth.defaultAccount, gas: estimatedGas + 1000});
      this.resetUIFields();
      this.getCurrentContributorData();
    } catch(e) {
      this.setState({errorMsg: 'tx failed? got enough tokens to award?'});
      console.error(e);
    } finally {
      this.setState({busy: false});
    }
  }


  async withdrawTokens(e) {
    const {currentContributor} = this.state;

    if (currentContributor.received === 0) {
      this.setState({errorMsg: 'can only call withdraw when you have tokens'});
      return;
    }

    if ( currentContributor.allocation > 0 ) {
      this.setState({errorMsg: 'you must allocate all your tokens'});
      return;
    }

    const toSend = Meritocracy.methods.withdraw();

    try {
      this.setState({busy: true});

      const estimatedGas = await toSend.estimateGas({from: web3.eth.defaultAccount});
      const receipt = await toSend.send({from: web3.eth.defaultAccount, gas: estimatedGas + 1000});

      this.getCurrentContributorData();
    } catch(e) {
      this.setState({errorMsg: 'tx failed? Did you allocate all your tokens first?'});
      console.error(e);
    } finally {
      this.setState({busy: false});
    }
  }

  render() {
    const { selectedContributors, contributorList, award, currentContributor, praise, busy, errorMsg } = this.state;

    const maxAllocation = selectedContributors.length ? currentContributor.allocation / selectedContributors.length : 0;

    return (<div>
      <h3>Status Meritocracy</h3>

      {errorMsg && <Alert bsStyle="danger">{errorMsg}</Alert>}

      {currentContributor.name &&  <h2>Hello, {currentContributor.name} !</h2>}
      <span>Your Total Received Kudos: { currentContributor.totalReceived || 0} SNT</span> <br/>
      <span>Your Total Forfeited Kudos: { currentContributor.totalForfeited || 0} SNT</span> <br/>

      <h4>Award Kudos</h4>
      <Select
          isMulti
          value={selectedContributors}
          onChange={this.handleContributorSelection}
          options={contributorList}
          placeholder="Choose Contributor(s)..."
          isDisabled={busy}
        />
      <span>Your Allocatable Kudos: { currentContributor.allocation } SNT</span> <br/>


      <br/>
      <NumericInput mobile step={5} min={0} max={maxAllocation} onChange={this.handleAwardChange} value={award} disabled={busy} />  <br/>

      <input disabled={busy} placeholder="Enter your praise..." onChange={this.handlePraiseChange} value={praise} />  <br/>
      <span> Total Awarding: {award * selectedContributors.length} SNT </span>   <br/>
      <Button disabled={busy} variant="outline-primary" onClick={this.awardTokens}>Award</Button>


      <h4>Your Kudos History</h4>
      <span>Your Received Kudos: <b>{ currentContributor.received } SNT</b> <Button variant="outline-primary"  onClick={this.withdrawTokens} disabled={busy}>Withdraw</Button></span>  <br/>
      <Grid>
        <Row>
          {currentContributor.praises && currentContributor.praises.map((item, i) => {
            const name = options.find(x => x.value === item.author);
            return <Col key={i}>{(name && name.label) || item.author} has sent you {web3.utils.fromWei(item.amount, "ether")} SNT {item.praise && "\"" + item.praise + "\""}</Col>;
          })}
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
};

export default Home;
