import React, { Component } from 'react';
import PropTypes from 'prop-types';

function compactAddress(addr) {
  return addr.substring(0, 6) + '...' + addr.substring(38);
}

class Address extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addressHovered: false,
      fixed: false
    };
  }

  mouseOverAddress = () => {
    this.setState({ addressHovered: true });
  };

  mouseOutAddress = () => {
    this.setState({ addressHovered: false });
  };

  handleClick = () => {
    this.setState({ fixed: !this.state.fixed });
  };

  render() {
    const address =
      this.props.compact || (!this.state.fixed && !this.state.addressHovered)
        ? compactAddress(this.props.value)
        : this.props.value;
    return (
      <span
        title={this.props.value}
        onClick={this.handleClick}
        onMouseOver={this.mouseOverAddress}
        onMouseOut={this.mouseOutAddress}
      >
        {address}
      </span>
    );
  }
}

Address.defaultProps = {
  compact: false
};

Address.propTypes = {
  value: PropTypes.string,
  compact: PropTypes.bool
};

export default Address;
