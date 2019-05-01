import React, { Component } from 'react';
import info from '../../images/info.svg';
import downArrow from '../../images/down-arrow.svg';

class Allocation extends Component {
  state = {
    showHelp: false
  };

  handleClickHelp = e => {
    e.preventDefault();
    this.setState(prevState => ({ showHelp: !prevState.showHelp }));
  };

  render() {
    const { value } = this.props;
    const { showHelp } = this.state;

    return (
      <div className="text-center p-4 allocation">
        <p className="text-muted mb-2">Reward Status contributors for all the times they impressed you.</p>
        <p className="mb-2">
          <a href="#" onClick={this.handleClickHelp}>
            Learn more <img src={downArrow} alt="" className="ml-2" />
          </a>
        </p>
        {showHelp && (
          <div className="text-muted text-left border rounded p-2 mb-2 learn-more">
            <img src={info} alt="" />
            <p className="m-0 p-0">
              Status Meritocracy is an SNT Reward System that allows a Contributor in the registry to award allocated
              SNT, along with praise, to other Contributors.
              <br />
              <a href="https://github.com/status-im/meritocracy/blob/master/register.md">Register</a> to receive a
              budget and participate.
            </p>
          </div>
        )}
        <p className="allocation mb-0">
          {value} <span className="text-muted">SNT</span>
        </p>
        <p className="text-muted">Available</p>
      </div>
    );
  }
}

export default Allocation;
