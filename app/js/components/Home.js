/*global web3*/
import React from 'react';
import {Row, Col, Alert, Button, Container, Form} from 'react-bootstrap';
import NumericInput from 'react-numeric-input';
import Select from 'react-select';

import Meritocracy from 'Embark/contracts/Meritocracy';

import {getFormattedContributorList, getCurrentContributorData} from '../services/Meritocracy';

/*
TODO:
- list praise for contributor
- listen to events to update UI, (initially on page load but within function calls)
*/

class Home extends React.Component {

  state = {
    errorMsg: null,
    busy: true,
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
    try {
      const contributorList = await getFormattedContributorList();

      const currentContributor = await getCurrentContributorData();

      this.setState({busy: false, currentContributor, contributorList});
    } catch (e) {
      this.setState({errorMsg: e.message || e});
    }
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
      const currentContributor = await getCurrentContributorData();
      this.setState({currentContributor});
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

      const currentContributor = await getCurrentContributorData();
      this.setState({currentContributor});
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
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
      {busy && <p>Working...</p>}

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
      <p>Your Allocatable Kudos: { currentContributor.allocation } SNT</p>

      {selectedContributors.length === 0 && <Alert variant="warning">
        Please select one or more contributors
      </Alert>}

      <NumericInput mobile step={5} min={0} max={maxAllocation} onChange={this.handleAwardChange} value={award} disabled={busy}/>

      <Form>
        <Form.Control disabled={busy} placeholder="Enter your praise..." onChange={this.handlePraiseChange}
                      value={praise} />
      </Form>
      <span> Total Awarding: {award * selectedContributors.length} SNT </span>   <br/>
      <Button disabled={busy} variant="outline-primary" onClick={this.awardTokens}>Award</Button>

      <h4>Your Kudos History</h4>
      <span>Your Received Kudos: <b>{ currentContributor.received } SNT</b> <Button variant="outline-primary" onClick={this.withdrawTokens} disabled={busy}>Withdraw</Button></span>  <br/>
      <Container>
        <Row>
          {currentContributor.praises && currentContributor.praises.map((item, i) => {
            const name = options.find(x => x.value === item.author);
            return <Col key={i}>{(name && name.label) || item.author} has sent you {web3.utils.fromWei(item.amount, "ether")} SNT {item.praise && "\"" + item.praise + "\""}</Col>;
          })}
        </Row>
      </Container>

    </div>);
  }
}

export default Home;
