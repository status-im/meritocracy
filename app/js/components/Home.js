/*global web3*/
import React, {Fragment} from 'react';
import {Row, Col, Alert, Button, Container, Form, Tabs, Tab} from 'react-bootstrap';
import Meritocracy from 'Embark/contracts/Meritocracy';
import arrowLeft from '../../images/arrow-left.svg';
import {getFormattedContributorList, getCurrentContributorData} from '../services/Meritocracy';
import './home.scss';
import Step1 from './Step1';
import Loading from './Loading';
import Complete from './Complete';
import Error from './Error';

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
    praise: '',
    step: 'ERROR',
    checkbox: false,
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
    this.setState({ selectedContributors: _selectedContributors }, () => {
      this._setAward(this.state.award);
    });
  }

  handleAwardChange(e) {
    if(e.target.value.trim() === "") {
      this.setState({award: ""});
      return;
    }
    this._setAward(e.target.value);
  }

  handlePlus5 = () => {
    this._setAward(this.state.award + 5);
  }
  
  _setAward = (value) => {
    let _amount = parseInt(value, 10);
    if(_amount < 0 || isNaN(_amount)) _amount = 0;
    
    const { currentContributor: {allocation}, selectedContributors} = this.state;
    const maxAllocation = selectedContributors.length ? Math.floor(allocation / selectedContributors.length) : 0;
    const award = (_amount <=  maxAllocation ? _amount : maxAllocation );

    this.setState({award});
  }

  handlePraiseChange(e) {
    this.setState({ praise: e.target.value });
  }

  handleCheckbox = (e) => {
    this.setState(prevState => ({ checkbox: !prevState.checkbox }));
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

    this.moveStep('BUSY');

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
      const estimatedGas = await toSend.estimateGas({from: web3.eth.defaultAccount});
      const receipt = await toSend.send({from: web3.eth.defaultAccount, gas: estimatedGas + 1000});
      this.resetUIFields();
      const currentContributor = await getCurrentContributorData();
      this.setState({currentContributor});
      this.moveStep('COMPLETE')();
    } catch(e) {
      this.setState({errorMsg: 'tx failed? got enough tokens to award?'});
      console.error(e);
    } finally {
      
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


  moveStep = nexStep => () => {
    this.setState({step: nexStep});
  }


  render() {
    const { selectedContributors, contributorList, award, currentContributor, praise, busy, errorMsg, step, checkbox } = this.state;

    if(errorMsg) return <Error title="Error" value={errorMsg} />;

    return (
      <Fragment>
        <Tabs defaultActiveKey="reward" className="home-tabs mb-3">
          <Tab eventKey="reward" title="Reward" className="reward-panel">
            
            {step === 'HOME' && (
              <Step1
                allocation={currentContributor.allocation}
                onChangeAward={this.handleAwardChange}
                onSelectContributor={this.handleContributorSelection}
                onClickPlus5={this.handlePlus5}
                contributorList={contributorList}
                selectedContributors={selectedContributors}
                award={award}
                isChecked={checkbox}
                onClickCheckbox={this.handleCheckbox}
                onClickNext={this.moveStep('PRAISE')}
              />
            )}

            {step === 'PRAISE' && (
              <div>
                <p className="text-center mt-5 text-muted">Research shows that a note of praise and learning how much our work helped others, increases motivation.</p>
                <p className="mb-0">
                  <span className="font-weight-bold">{ selectedContributors.map(x => x.label).join(', ') }</span>
                  <span className="float-right text-muted">SNT <b>{award * selectedContributors.length}</b></span>
                </p>
                <Form>
                  <Form.Label className="small-text">Add note</Form.Label>
                  <Form.Control disabled={busy} as="textarea" rows="5" onChange={this.handlePraiseChange}
                                    value={praise} className="p-2"/>
                </Form>
                <div className="fixed-bottom bg-white">
                  <Button onClick={this.moveStep('HOME')} variant="link"><img src={arrowLeft} alt="" className="mr-2" /> Back</Button>
                  <Button disabled={busy} variant="primary" className="float-right mr-2 mb-2" onClick={this.awardTokens}>Award</Button>
                </div>
              </div>
            )}

            { step === 'BUSY' && <Loading /> }
            { step === 'COMPLETE' && <Complete onClick={this.moveStep('HOME')} /> }
            { step === 'ERROR' && <Error onClick={this.moveStep('PRAISE')} title="Error" message="Your transaction could not be processed" /> }
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
      </Fragment>
    );
  }
}

export default Home;
