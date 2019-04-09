/*global web3*/
import React from 'react';
import {HashRouter, Route, Redirect, Switch} from "react-router-dom";

import EmbarkJS from 'Embark/EmbarkJS';

import Home from './components/Home';

const MAINNET = 1;
const TESTNET = 3;

class App extends React.Component {

  state = {
    error: null,
    loading: true
  };

  componentDidMount() {
    EmbarkJS.onReady(async (err) => {
      if (err) {
        return this.setState({error: err.message || err});
      }

      const netId = await web3.eth.net.getId();
      if (EmbarkJS.environment === 'testnet' && netId !== TESTNET) {
        return this.setState({error: 'Please connect to Ropsten'});
      }
      if (EmbarkJS.environment === 'livenet' && netId !== MAINNET) {
        return this.setState({error: 'Please connect to Mainnet'});
      }
      this.setState({loading: false})
    });
  }

  render() {
    const {error, loading} = this.state;

    if (error) {
      return (<div>
        <div>Something went wrong connecting to Ethereum. Please make sure you have a node running or are using Metamask
          to connect to the Ethereum network:
        </div>
        <div>{error}</div>
      </div>);
    }

    if (loading) {
      return <p>Loading, please wait</p>;
    }

    return (<HashRouter>
        <Switch>
          <Route exact path="/" component={Home}/>

          <Redirect to="/404"/>
        </Switch>
    </HashRouter>);
  }
}

export default App;
