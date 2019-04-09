/*global web3*/
import React from 'react';
import {Button, Form, Alert} from 'react-bootstrap';
import ValidatedForm from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {required, isAddress} from '../validators';

import {addContributor} from '../services/Meritocracy';

class Admin extends React.Component {
  state = {
    contributorName: '',
    contributorAddress: '',
    busy: false,
    error: ''
  };

  onChange = (name, e) => {
    this.setState({[name]: e.target.value});
  };

  addContributor = async (e) => {
    e.preventDefault();
    this.setState({busy: true});
    try {
      await addContributor(this.state.contributorName, this.state.contributorAddress);
      this.setState({contributorName: '', contributorAddress: '', busy: false});
    } catch (e) {
      this.setState({error: e.message || e, busy: false});
    }
  };

  render() {
    const {contributorAddress, contributorName, error, busy} = this.state;

    return (<div>
      <h2>Admin Panel</h2>
      {error && <Alert variant="danger">{error}</Alert>}
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
    </div>);
  }
}

export default Admin;
