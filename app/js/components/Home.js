/*global web3*/
import React from 'react';
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
import { sortByAlpha } from '../utils';
import Praise from './Praise';
import InfiniteScroll from 'react-infinite-scroller';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider, Query } from 'react-apollo';

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/richard-ramos/kudos-dapp",
  cache: new InMemoryCache()
});

const THE_WALL_QUERY = gql`
  query WallQuery($skip: Int) {
    kudos(first: 20, skip: $skip, orderBy: timestamp, orderDirection: desc){
      from,
      to,
      praise,
      timestamp,
      amount
    }
  }
`;

const MY_RECEIVED_KUDOS = gql`
  query KudosQUery($to: [Bytes]!, $skip: Int) {
    kudos(where: {to: $to}, first: 50, skip: $skip, orderBy: timestamp, orderDirection: desc){
      from,
      to,
      praise,
      timestamp,
      amount
    }
  }
`;

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
      errorMsg,
      step,
      checkbox,
      tab
    } = this.state;

    if (errorMsg) return <Error title="Error" message={errorMsg} onClick={this.moveStep('HOME')} />;

    return (
      <ApolloProvider client={client}>
        <Tabs className="home-tabs mb-3" activeKey={tab} onSelect={tab => this.setState({ tab })}>
          <Tab eventKey="reward" title="Reward" className="reward-panel">
            {step === 'HOME' && (
              <Step1
                allocation={currentContributor.allocation}
                onChangeAward={this.handleAwardChange}
                onSelectContributor={this.handleContributorSelection}
                onClickPlus5={this.handlePlus5}
                contributorList={contributorList.filter(x => x.value !== currentContributor.addr)}
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
              <Query
                query={THE_WALL_QUERY}
              >
                {({ data, error, loading, fetchMore }) => {

                  const loadMore = () => fetchMore({
                    variables: {
                      first: 30,
                      skip: data.kudos.length
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult) return prev;
                      return Object.assign({}, prev, {
                        kudos: [...prev.kudos, ...fetchMoreResult.kudos]
                      });
                    }
                  });

                  if(loading) return <p>Loading...</p>;

                  if(error) return <Error title="Error" message={error.message} />;

                  return (
                    <InfiniteScroll
                      pageStart={0}
                      loadMore={loadMore}
                      hasMore={true}
                      loader={<p key={new Date().getTime()}>Loading...</p>}
                      initialLoad={false}
                    >
                      {data.kudos.map((item, i) => (
                        <Praise key={i} individual={false} contributorList={contributorList} item={item} />
                      ))}
                    </InfiniteScroll>
                  );
                }}
              </Query>
            </Container>
          </Tab>
          <Tab eventKey="withdraw" title="Withdraw" className="withdraw-panel">
            {step === 'HOME' && (
              <Query
                query={MY_RECEIVED_KUDOS}
                variables={{to: [web3.eth.defaultAccount]}}
              >
                {({ data, error, loading, fetchMore }) => {

                  const loadMore = () => fetchMore({
                    variables: {
                      first: 30,
                      skip: data.kudos.length,
                      to: [web3.eth.defaultAccount]
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult) return prev;
                      return Object.assign({}, prev, {
                        kudos: [...prev.kudos, ...fetchMoreResult.kudos]
                      });
                    }
                  });

                  if(loading) return <p>Loading...</p>;

                  if(error) return <Error title="Error" message={error.message} />;

                  return (
                    <Withdrawal
                      onClick={this.withdrawTokens}
                      received={currentContributor.received}
                      allocation={currentContributor.allocation}
                      contributorList={contributorList}
                      praises={data.kudos}
                      onLoadMore={loadMore}
                    />
                  );
                }}
              </Query>
            )}

            {step === 'BUSY' && <Loading />}

            {step === 'COMPLETE' && <Complete onClick={this.moveStep('HOME')} />}
          </Tab>
        </Tabs>
      </ApolloProvider>
    );
  }
}

export default Home;
