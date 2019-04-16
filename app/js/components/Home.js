/*global web3*/
import React, {Fragment} from 'react';
import {Row, Col, Alert, Button, Container, Form, Tabs, Tab} from 'react-bootstrap';
import NumericInput from 'react-numeric-input';
import Select from 'react-select';

import Meritocracy from 'Embark/contracts/Meritocracy';

import {getFormattedContributorList, getCurrentContributorData} from '../services/Meritocracy';

import './home.scss';

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

    const orderedContributors = contributorList.sort((a,b) => {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 0;
    });

    return (<Fragment>
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
      {busy && <p>Working...</p>}

      <Tabs defaultActiveKey="reward" className="home-tabs mb-3">
        <Tab eventKey="reward" title="Reward" className="reward-panel">
          <div className="text-center p-4">
            <p className="text-muted">Reward Status contributors for all the times they impressed you.</p>
            <p className="allocation mb-0">{currentContributor.allocation} <span className="text-muted">SNT</span></p>
            <p className="text-muted">Available</p>
          </div>

          <Select
            isMulti
            value={selectedContributors}
            onChange={this.handleContributorSelection}
            options={orderedContributors}
            placeholder="Choose Contributor(s)..."
            isDisabled={busy}
            className="mb-2"
          />

          {selectedContributors.length === 0 && <Alert variant="secondary">
            Please select one or more contributors
          </Alert>}

          <NumericInput mobile step={5} min={0} max={maxAllocation} onChange={this.handleAwardChange} value={award}
                        disabled={busy} className="form-control mb-2"/>

          <Form>
            <Form.Control disabled={busy} placeholder="Enter your praise..." onChange={this.handlePraiseChange}
                          value={praise}/>
          </Form>
          <p className="text-center"> Total Awarding: {award * selectedContributors.length} SNT </p>
          <p className="text-center"><Button disabled={busy} variant="outline-primary" onClick={this.awardTokens}>Award</Button></p>
        </Tab>

        <Tab eventKey="withdraw" title="Withdraw">
          <p>Your Total Received Kudos: {currentContributor.totalReceived || 0} SNT</p>
          <p>Your Total Forfeited Kudos: {currentContributor.totalForfeited || 0} SNT</p>

          <h4>Your Kudos History</h4>
          <p>Your Received Kudos: <b>{currentContributor.received} SNT</b></p>

          <p className="text-center">
            <Button variant="outline-primary" onClick={this.withdrawTokens} disabled={busy}>
              Withdraw
            </Button>
          </p>

          <Container>
            <Row>
              {currentContributor.praises && currentContributor.praises.map((item, i) => {
                const name = options.find(x => x.value === item.author);
                return <Col key={i}>{(name && name.label) || item.author} has sent
                  you {web3.utils.fromWei(item.amount, "ether")} SNT {item.praise && "\"" + item.praise + "\""}</Col>;
              })}
            </Row>
          </Container>
        </Tab>
      </Tabs>
    </Fragment>);
  }
}

export default Home;
