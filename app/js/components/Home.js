/*global web3*/
import React, { Fragment } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import Meritocracy from 'Embark/contracts/Meritocracy';
import { getFormattedContributorList, getCurrentContributorData, getAllPraises } from '../services/Meritocracy';
import './home.scss';
import Step1 from './Step1';
import Step2 from './Step2';
import Loading from './Loading';
import Complete from './Complete';
import Error from './Error';
import Withdrawal from './Withdrawal';
import { sortByAlpha, sortByAttribute } from '../utils';
import Praise from './Praise';
/*
TODO:
- list praise for contributor
- listen to events to update UI, (initially on page load but within function calls)
*/

class Home extends React.Component {
  state = {
    errorMsg: null,
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
    step: 'HOME',
    checkbox: false,
    tab: 'reward',
    praises: []
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

      this.setState({ busy: false, currentContributor, contributorList: contributorList.sort(sortByAlpha('label')) });

      getAllPraises().then(praises => {
        this.setState({ praises: praises.sort(sortByAttribute('time')) });
      });
    } catch (error) {
      this.setState({ errorMsg: error.message || error });
    }
  }

  handleContributorSelection(_selectedContributors) {
    this.setState({ selectedContributors: _selectedContributors }, () => {
      this._setAward(this.state.award);
    });
  }

  handleAwardChange(e) {
    if (e.target.value.trim() === '') {
      this.setState({ award: '' });
      return;
    }
    this._setAward(e.target.value);
  }

  handlePlus5 = () => {
    this._setAward(this.state.award + 5);
  };

  _setAward = value => {
    let _amount = parseInt(value, 10);
    if (_amount < 0 || isNaN(_amount)) _amount = 0;

    const {
      currentContributor: { allocation },
      selectedContributors
    } = this.state;
    const maxAllocation = selectedContributors.length > 0 ? Math.floor(allocation / selectedContributors.length) : 0;
    const award = _amount <= maxAllocation ? _amount : maxAllocation;

    this.setState({ award });
  };

  handlePraiseChange(e) {
    this.setState({ praise: e.target.value });
  }

  handleCheckbox = () => {
    this.setState(prevState => ({ checkbox: !prevState.checkbox }));
  };

  resetUIFields() {
    this.setState({
      praise: '',
      selectedContributors: [],
      errorMsg: '',
      award: 0,
      checkbox: false
    });
  }

  async awardTokens() {
    const { award, selectedContributors, praise } = this.state;

    this.moveStep('BUSY')();

    let addresses = selectedContributors.map(a => a.value);

    const sntAmount = web3.utils.toWei(award.toString(), 'ether');

    let toSend;

    switch (addresses.length) {
      case 0:
        this.setState({ errorMsg: 'No Contributor Selected' });
        return;
      case 1:
        toSend = Meritocracy.methods.award(addresses[0], sntAmount, praise);
        break;
      default:
        toSend = Meritocracy.methods.awardContributors(addresses, sntAmount, praise);
        break;
    }

    try {
      const estimatedGas = await toSend.estimateGas({ from: web3.eth.defaultAccount });
      await toSend.send({ from: web3.eth.defaultAccount, gas: estimatedGas + 1000 });
      this.resetUIFields();
      const currentContributor = await getCurrentContributorData();
      this.setState({ currentContributor });
      this.moveStep('COMPLETE')();
    } catch (error) {
      this.setState({ errorMsg: 'tx failed? got enough tokens to award?' });
      console.error(error);
    }
  }

  async withdrawTokens() {
    const { currentContributor } = this.state;

    if (currentContributor.received === 0) {
      this.setState({ errorMsg: 'can only call withdraw when you have tokens' });
      return;
    }

    if (currentContributor.allocation > 0) {
      this.setState({ errorMsg: 'you must allocate all your tokens' });
      return;
    }

    this.moveStep('BUSY')();

    const toSend = Meritocracy.methods.withdraw();

    try {
      this.setState({ busy: true });

      const estimatedGas = await toSend.estimateGas({ from: web3.eth.defaultAccount });
      await toSend.send({ from: web3.eth.defaultAccount, gas: estimatedGas + 1000 });

      const currentContributor = await getCurrentContributorData();
      this.setState({ currentContributor });

      this.moveStep('COMPLETE')();
    } catch (error) {
      console.error(error);
      this.setState({ errorMsg: 'tx failed? Did you allocate all your tokens first?' });
    }
  }

  moveStep = nexStep => () => {
    this.setState({ step: nexStep, errorMsg: '' });
  };

  render() {
    const {
      selectedContributors,
      contributorList,
      award,
      currentContributor,
      praise,
      praises,
      errorMsg,
      step,
      checkbox,
      tab
    } = this.state;

    if (errorMsg) return <Error title="Error" message={errorMsg} onClick={this.moveStep('HOME')} />;

    return (
      <Fragment>
        <Tabs className="home-tabs mb-3" activeKey={tab} onSelect={tab => this.setState({ tab })}>
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
              <Step2
                selectedContributors={selectedContributors}
                award={award}
                praise={praise}
                onChangeNote={this.handlePraiseChange}
                onClickBack={this.moveStep('HOME')}
                onClickAward={this.awardTokens}
              />
            )}

            {step === 'BUSY' && <Loading />}

            {step === 'COMPLETE' && <Complete onClick={this.moveStep('HOME')} />}
          </Tab>
          <Tab eventKey="wall" title="Wall">
            <Container className="pt-4">
              {praises.map((item, i) => (
                <Praise key={i} individual={false} contributorList={contributorList} item={item} />
              ))}
            </Container>
          </Tab>
          <Tab eventKey="withdraw" title="Withdraw" className="withdraw-panel">
            {step === 'HOME' && (
              <Withdrawal
                onClick={this.withdrawTokens}
                received={currentContributor.received}
                allocation={currentContributor.allocation}
                contributorList={contributorList}
                praises={currentContributor.praises}
              />
            )}

            {step === 'BUSY' && <Loading />}

            {step === 'COMPLETE' && <Complete onClick={this.moveStep('HOME')} />}
          </Tab>
        </Tabs>
      </Fragment>
    );
  }
}

export default Home;
