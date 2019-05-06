import React, { Fragment } from 'react';
import { Button, Form, Alert, ListGroup, OverlayTrigger, Tooltip, Modal, Tabs, Tab, Table } from 'react-bootstrap';
import ValidatedForm from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import { required, isAddress, isNumber, higherThan } from '../validators';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { addContributor, getFormattedContributorList, removeContributor, getContributorData } from '../services/Meritocracy';
import { sortByAlpha, sortByAttribute, sortNullableArray } from '../utils';

import './admin.scss';

const sort = (orderBy) => {
  if(orderBy === 'praises') return sortNullableArray('praises');
  if(orderBy === 'label') return sortByAlpha('label');
  return sortByAttribute(orderBy);
};

class Admin extends React.Component {
  state = {
    contributorName: '',
    contributorAddress: '',
    busy: true,
    error: '',
    successMsg: '',
    contributorList: [],
    showDeleteModal: false,
    focusedContributorIndex: -1,
    sortBy: 'label',
    tab: 'admin',
    sntPerContributor: 0,
  };

  async componentDidMount() {
    try {
      const contributorList = await getFormattedContributorList();

      this.setState({ busy: false, contributorList });

      // TODO: this can be replaced by event sourcing
      contributorList.forEach(contrib => {
        getContributorData(contrib.value)
          .then(data => {
            contrib = Object.assign(contrib, data);
            this.setState({contributorList});
          });
      });

    } catch (error) {
      this.setState({ errorMsg: error.message || error });
    }
  }

  onChange = (name, e) => {
    this.setState({ [name]: e.target.value });
  };

  addContributor = async e => {
    e.preventDefault();
    this.setState({ busy: true, successMsg: '' });
    try {
      await addContributor(this.state.contributorName, this.state.contributorAddress);

      const contributorList = this.state.contributorList;
      contributorList.push({ label: this.state.contributorName, value: this.state.contributorAddress });

      this.setState({ busy: false, successMsg: 'Contributor added!' });
    } catch (error) {
      this.setState({ error: error.message || error, busy: false });
    }
  };

  removeContributor = (e, contributorIndex) => {
    e.preventDefault();
    this.setState({ focusedContributorIndex: contributorIndex, showDeleteModal: true });
  };

  doRemove = async () => {
    const idx = this.state.focusedContributorIndex;
    this.setState({ focusedContributorIndex: -1, showDeleteModal: false, busy: true });
    try {
      await removeContributor(this.state.contributorList[idx].value);

      const contributorList = this.state.contributorList;
      contributorList.splice(idx, 1);

      this.setState({ contributorList, busy: false, successMsg: 'Contributor removed!' });
    } catch (error) {
      this.setState({ error: error.message || error, busy: false });
    }
  };

  handleClose = () => {
    this.setState({ showDeleteModal: false });
  };

  sortBy = (order) => () => {
    this.setState({sortBy: order});
  }

  render() {
    const {
      contributorAddress,
      contributorName,
      error,
      busy,
      contributorList,
      successMsg,
      focusedContributorIndex,
      sortBy,
      tab,
      sntPerContributor
    } = this.state;
    const currentContributor = focusedContributorIndex > -1 ? contributorList[focusedContributorIndex] : {};
    const sortedContributorList = contributorList.sort(sort(sortBy));

    return (
      <Fragment>
        <Tabs className="home-tabs mb-3" activeKey={tab} onSelect={tab => this.setState({ tab })}>
          <Tab eventKey="admin" title="Contributors" className="admin-panel">
            <h2>Contributors</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}
            {busy && <Alert variant="primary">Working...</Alert>}
            <h3>Add a contributor</h3>
            <ValidatedForm onSubmit={e => this.addContributor(e)}>
              <Form.Group controlId="formContributor">
                <Form.Label>Contributor name</Form.Label>
                <Input
                  type="text"
                  placeholder="Name"
                  value={contributorName}
                  onChange={e => this.onChange('contributorName', e)}
                  className="form-control"
                  validations={[required]}
                />
              </Form.Group>

              <Form.Group controlId="formAddress">
                <Form.Label>Contributor address</Form.Label>
                <Input
                  type="text"
                  placeholder="0x"
                  value={contributorAddress}
                  onChange={e => this.onChange('contributorAddress', e)}
                  className="form-control"
                  validations={[required, isAddress]}
                />
              </Form.Group>
              <Button variant="primary" onClick={e => this.addContributor(e)}>
                Add
              </Button>
            </ValidatedForm>
            <hr className="mt-5 mb-5" />
            <h3>Contributor List</h3>
            <ListGroup>
              {contributorList.sort(sortByAlpha('label')).map((contributor, idx) => (
                <ListGroup.Item key={contributor.value} action className="contributor-item">
                  <span className="font-weight-bold">{contributor.label}:</span> <span className="text-small">{contributor.value}</span>
                  <div className="contributor-controls float-right">
                    <OverlayTrigger placement="top" overlay={<Tooltip>Delete contributor</Tooltip>}>
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-danger icon"
                        onClick={e => this.removeContributor(e, idx)}
                      />
                    </OverlayTrigger>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Tab>
          <Tab eventKey="allocation" title="Allocation" className="allocation-panel">
            <h2>Allocation</h2>
            <ValidatedForm onSubmit={e => {alert("TODO")}}>
              <Form.Group controlId="fundAllocation">
                <Form.Label>SNT per contributor</Form.Label>
                <Form.Text className="text-muted">
                  Total: {(contributorList.length * parseInt(sntPerContributor, 10)) || 0} SNT
                </Form.Text>
                <Input
                  type="text"
                  placeholder="0"
                  value={sntPerContributor}
                  onChange={e => this.onChange('sntPerContributor', e)}
                  className="form-control"
                  validations={[required, isNumber, higherThan.bind(null, 0)]}
                />
              </Form.Group>
              <Button variant="primary" onClick={e => {alert("TODO")}}>
                Allocate Funds
              </Button>
            </ValidatedForm>
            <hr className="mt-5 mb-5" />
            <ValidatedForm onSubmit={e => {alert("TODO")}}>
              <Form.Group>
                <Button variant="primary" onClick={e => {alert("TODO")}}>
                  Forfeit Allocation
                </Button>
                <Form.Text className="text-muted">
                  Forfeited N days ago
                </Form.Text>
              </Form.Group>
              
            </ValidatedForm>
          </Tab>
          <Tab eventKey="leaderboard" title="Leaderboard" className="leaderboard-panel">
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
                { 
                  sortedContributorList.map((contrib, i) => (
                    <tr key={i}>
                      <td>{contrib.label}</td>
                      <td>{contrib.allocation}</td>
                      <td>{contrib.totalReceived}</td>
                      <td>{contrib.totalForfeited}</td>
                      <td>{contrib.praises ? contrib.praises.length : 0}</td>
                    </tr>
                  ))
                } 
              </tbody>
            </Table>
          </Tab>
        </Tabs>
        <Modal show={this.state.showDeleteModal} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Are you sure you want to remove this contributor?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Name: {currentContributor.label}</p>
            <p>Address: {currentContributor.value}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={this.doRemove}>
              Remove
            </Button>
          </Modal.Footer>
        </Modal>
      </Fragment>
    );
  }
}

export default Admin;
