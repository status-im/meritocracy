import React from 'react';
import { Table } from 'react-bootstrap';
import { getFormattedContributorList, getContributorData } from '../services/Meritocracy';
import { sortByAlpha, sortByAttribute, sortNullableArray } from '../utils';

const sort = orderBy => {
  if (orderBy === 'praises') return sortNullableArray('praises');
  if (orderBy === 'label') return sortByAlpha('label');
  return sortByAttribute(orderBy);
};

class Leaderboard extends React.Component {
  state = {
    contributorList: [],
    sortBy: 'label',
    errorMsg: ''
  };

  async componentDidMount() {
    try {
      const contributorList = await getFormattedContributorList();
      this.setState({ contributorList });

      // TODO: this can be replaced by event sourcing
      contributorList.forEach(contrib => {
        getContributorData(contrib.value).then(data => {
          contrib = Object.assign(contrib, data);
          this.setState({ contributorList });
        });
      });
    } catch (error) {
      this.setState({ errorMsg: error.message || error });
    }
  }

  sortBy = order => () => {
    this.setState({ sortBy: order });
  };

  render() {
    const { contributorList, sortBy } = this.state;
    const sortedContributorList = contributorList.sort(sort(sortBy));
    return (
      <React.Fragment>
        <h2>Leaderboard</h2>
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th onClick={this.sortBy('label')}>Contributor</th>
              <th onClick={this.sortBy('allocation')}>Allocation</th>
              <th onClick={this.sortBy('totalReceived')}>SNT Received</th>
              <th onClick={this.sortBy('totalForfeited')}>SNT Forfeited</th>
              <th onClick={this.sortBy('praises')}>Praises Received</th>
            </tr>
          </thead>
          <tbody>
            {sortedContributorList.map((contrib, i) => (
              <tr key={i}>
                <td>{contrib.label}</td>
                <td>{contrib.allocation}</td>
                <td>{contrib.totalReceived}</td>
                <td>{contrib.totalForfeited}</td>
                <td>{contrib.praises ? contrib.praises.length : 0}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </React.Fragment>
    );
  }
}

export default Leaderboard;
