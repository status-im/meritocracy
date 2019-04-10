/*global web3*/
import React, {Fragment} from 'react';
import {HashRouter, Route, Redirect, Switch} from "react-router-dom";
import ThemeProvider from 'react-bootstrap/ThemeProvider';

import EmbarkJS from 'Embark/EmbarkJS';

import Header from './components/Header';
import Home from './components/Home';
import Admin from './components/Admin';

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
      <ThemeProvider prefixes={{ btn: 'my-btn' }}>
        <Header/>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/admin" component={Admin}/>

          <Redirect to="/404"/>
        </Switch>
      </ThemeProvider>
    </HashRouter>);
  }
}

export default App;
