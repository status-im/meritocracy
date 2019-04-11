/*global web3*/
import React, {Fragment} from 'react';
import {Button, Form, Alert, ListGroup, OverlayTrigger, Tooltip, Modal} from 'react-bootstrap';
import ValidatedForm from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {required, isAddress} from '../validators';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";

import {addContributor, getFormattedContributorList, removeContributor} from '../services/Meritocracy';

import './admin.scss';

class Admin extends React.Component {
  state = {
    contributorName: '',
    contributorAddress: '',
    busy: true,
    error: '',
    successMsg: '',
    contributorList: [],
    showDeleteModal: false,
    focusedContributorIndex: -1
  };

  async componentDidMount() {
    try {
      const contributorList = await getFormattedContributorList();

      this.setState({busy: false, contributorList});
    } catch (e) {
      this.setState({errorMsg: e.message || e});
    }
  }

  onChange = (name, e) => {
    this.setState({[name]: e.target.value});
  };

  addContributor = async (e) => {
    e.preventDefault();
    this.setState({busy: true, successMsg: ''});
    try {
      await addContributor(this.state.contributorName, this.state.contributorAddress);

      const contributorList = this.state.contributorList;
      contributorList.push({label: this.state.contributorName, value: this.state.contributorAddress});

      this.setState({busy: false, successMsg: 'Contributor added!'});
    } catch (e) {
      this.setState({error: e.message || e, busy: false});
    }
  };

  removeContributor = (e, contributorIndex) => {
    e.preventDefault();
    this.setState({focusedContributorIndex: contributorIndex, showDeleteModal: true});
  };

  doRemove = async () => {
    const idx = this.state.focusedContributorIndex;
    this.setState({focusedContributorIndex: -1, showDeleteModal: false, busy: true});
    try {
      await removeContributor(this.state.contributorList[idx].value);

      const contributorList = this.state.contributorList;
      contributorList.splice(idx, 1);

      this.setState({contributorList, busy: false, successMsg: 'Contributor removed!'});
    } catch (e) {
      this.setState({error: e.message || e, busy: false});
    }
  };

  handleClose = () => {
    this.setState({showDeleteModal: false});
  };

  render() {
    const {contributorAddress, contributorName, error, busy, contributorList, successMsg, focusedContributorIndex} = this.state;
    const currentContributor = focusedContributorIndex > -1 ? contributorList[focusedContributorIndex] : {};

    return (<Fragment>
      <h2>Admin Panel</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {busy && <Alert variant="primary">Working...</Alert>}
      <h3>Add a contributor</h3>
      <ValidatedForm onSubmit={(e) => this.addContributor(e)}>
        <Form.Group controlId="formContributor">
          <Form.Label>Contributor name</Form.Label>
          <Input type="text" placeholder="Name" value={contributorName}
                 onChange={(e) => this.onChange('contributorName', e)}
                 className="form-control"
                 validations={[required]}/>
        </Form.Group>

        <Form.Group controlId="formAddress">
          <Form.Label>Contributor address</Form.Label>
          <Input type="text" placeholder="0x" value={contributorAddress}
                 onChange={(e) => this.onChange('contributorAddress', e)}
                 className="form-control"
                 validations={[required, isAddress]}/>
        </Form.Group>
        <Button variant="primary" onClick={(e) => this.addContributor(e)}>Add</Button>
      </ValidatedForm>
      <h3>Contributor List</h3>
      <ListGroup>
        {contributorList.map((contributor, idx) => (
          <ListGroup.Item key={contributor.value} action className="contributor-item">
            <span className="font-weight-bold">{contributor.label}:</span> {contributor.value}

            <div className="contributor-controls float-right">
              <OverlayTrigger placement="top"
                              overlay={
                                <Tooltip>
                                  Delete contributor
                                </Tooltip>
                              }>
                <FontAwesomeIcon icon={faTrash} className="text-danger icon" onClick={(e) => this.removeContributor(e, idx)}/>
              </OverlayTrigger>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

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
    </Fragment>);
  }
}

export default Admin;
