import React from 'react';
import ReactDOM from 'react-dom';
import {Tabs, Tab, Button } from 'react-bootstrap';
import * as NumericInput from 'react-numeric-input';
import Select from 'react-select';

import EmbarkJS from 'Embark/EmbarkJS';
// import Blockchain from './components/blockchain';

import Meritocracy from 'Embark/contracts/Meritocracy';

// import './css/dapp.css';


// EmbarkJS.onReady(function(error) {
//   if (error) {
//     console.error('Error while connecting to web3', error);
//     return;
//   }
//   // start using contracts
//   // Meritocracy.methods.set(100).send();
//   var owner = await Meritocracy.methods.owner().call();
//   console.log(owner);
// });


const options = [
  { value: '0x0', label: 'Jarrad (0x0000..0000)' },
  { value: '0x1', label: 'Strawberry (0x0000..0000)' },
  { value: '0x2', label: 'Vanilla (0x0000..0000)' }
];


class App extends React.Component {

  constructor(props) {
    super(props);

    this.handleSelect = this.handleSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      error: null,
      activeKey: 1,
      whisperEnabled: false,
      storageEnabled: false,
      blockchainEnabled: false,

      selectedOption: null,
    };
  }

  componentDidMount() {
    EmbarkJS.onReady((err) => {
      this.setState({blockchainEnabled: true});
      if (err) {
        // If err is not null then it means something went wrong connecting to ethereum
        // you can use this to ask the user to enable metamask for e.g
        return this.setState({error: err.message || err});
      }
    });
  }

  _renderStatus(title, available) {
    let className = available ? 'pull-right status-online' : 'pull-right status-offline';
    return <React.Fragment>
      {title}
      <span className={className}></span>
    </React.Fragment>;
  }

  handleSelect(key) {
    // this.setState({ activeKey: key });
  }

  handleChange(selectedOption) {
    this.setState({ selectedOption });
    console.log(`Option selected:`, selectedOption);
  }

  render() {
    const { selectedOption } = this.state;
    if (this.state.error) {
      return (<div>
        <div>Something went wrong connecting to ethereum. Please make sure you have a node running or are using metamask to connect to the ethereum network:</div>
        <div>{this.state.error}</div>
      </div>);
    }
    return (<div>
      <h3>Meritocracy</h3>
      <Tabs onSelect={this.handleSelect} activeKey={this.state.activeKey} id="uncontrolled-tab-example">
        <Tab eventKey={1} title={this._renderStatus('Contributors', true)}>
          <span>Your Allocation: 500</span>
          <span>Your Award: 500 <Button variant="outline-primary">Withdraw</Button></span>
          
          <NumericInput mobile step={5} min={0} />
          <Select
              isMulti
              defaultValue={selectedOption}
              onChange={this.handleChange}
              options={options}
              placeholder="Choose Contributor(s)..."
            />
            <input value="bsadsad" placeholder="Enter your praise..." />
            <span> Total Award: 450 </span> 
          <Button variant="outline-primary">Allocate</Button>
        </Tab>
        <Tab eventKey={2} title={this._renderStatus('Admins', true)}>
           <div>lol</div>
        </Tab>
        <Tab eventKey={3} title={this._renderStatus('Leaderboard', true)}>
           <div>¯\_(ツ)_/¯</div>
        </Tab>
      </Tabs>
    </div>);
  }
}

ReactDOM.render(<App></App>, document.getElementById('app'));
