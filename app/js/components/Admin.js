/*global web3*/
import React from 'react';
import {Button, Form} from 'react-bootstrap';
import ValidatedForm from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {required, isAddress} from '../validators';

class Admin extends React.Component {
  state = {
    contributorName: '',
    contributorAddress: ''
  };

  onChange = (name, e) => {
    this.setState({[name]: e.target.value});
  };

  addContributor = (e) => {
    e.preventDefault();
    console.log('Submit', this.state);
  };

  render() {
    const {contributorAddress, contributorName} = this.state;


    return (<div>
      <h2>Admin Panel</h2>
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
