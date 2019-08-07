/* global web3 */
import React, { Fragment } from 'react';
import { Button, Form, Alert, ListGroup, OverlayTrigger, Tooltip, Modal, Tabs, Tab, InputGroup } from 'react-bootstrap';
import ValidatedForm from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import { required, isAddress, isNumber, higherThan } from '../validators';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  addContributor,
  getFormattedContributorList,
  removeContributor,
  forfeitAllocation,
  lastForfeited,
  allocate,
  getAllowance,
  approve,
  resetAllowance,
  getSNTBalance,
  getSNTForfeitedBalance,
  getRegistryNum
} from '../services/Meritocracy';
import { sortByAlpha } from '../utils';
import moment from 'moment';

import './admin.scss';

const {toBN, toWei, fromWei} = web3.utils;

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
    lastForfeited: null,
    allowance: '0',
    balance: '0',
    forfeitedBalance: '0',
    registryNum: 0
  };

  async componentDidMount() {
    try {
      const contributorList = await getFormattedContributorList();

      this.setState({ busy: false, contributorList });

      this.getLastForfeitDate();
      this.getAllowance();
      this.getSNTForfeitedBalance();
      this.getRegistryNum();
    } catch (error) {
      this.setState({ errorMsg: error.message || error });
    }
  }

  getAllowance = async () => {
    const allowance = await getAllowance();
    const balance = await getSNTBalance();
    this.setState({allowance, balance});
  }

  getRegistryNum = async () => {
    const registryNum = parseInt(await getRegistryNum(), 10);
    this.setState({registryNum});
  }

  onChange = (name, e) => {
    this.setState({ [name]: e.target.value });
  };

  getSNTForfeitedBalance = async () => {
    const forfeitedBalance = await getSNTForfeitedBalance();
    this.setState({forfeitedBalance});
  }

  getLastForfeitDate = async () => {
    const date = await lastForfeited();
    this.setState({ lastForfeited: date });
  };

  addContributor = async e => {
    e.preventDefault();
    this.setState({ busy: true, successMsg: '', error: '' });
    try {
      await addContributor(this.state.contributorName, this.state.contributorAddress);

      const contributorList = this.state.contributorList;
      contributorList.push({ label: this.state.contributorName, value: this.state.contributorAddress });

      this.setState({ busy: false, successMsg: 'Contributor added!' });

      this.getRegistryNum();
    } catch (error) {
      this.setState({ error: error.message || error, busy: false });
    }
  };

  allocateFunds = async e => {
    e.preventDefault();

    /* eslint-disable-next-line no-alert*/
    if (!confirm('Are you sure?')) return;

    this.setState({ busy: true, successMsg: '', error: '' });

    const { sntPerContributor, registryNum, forfeitedBalance } = this.state;
    
    const SNTForfeitedBalance = fromWei(forfeitedBalance, "ether");
    const individualSNTBalance = Math.floor(parseInt(SNTForfeitedBalance, 10) / registryNum);

    let sntAmount = '0';
    if(individualSNTBalance >= 0 && sntPerContributor > 0){
      const totalAmountAllocated = toBN(toWei(individualSNTBalance.toString(), "ether")).add(toBN(toWei(sntPerContributor.toString(), "ether"))).mul(toBN(registryNum));
      sntAmount = totalAmountAllocated.sub(toBN(forfeitedBalance));
      if(sntAmount.lt(toBN(0))) sntAmount = toBN(0);
      sntAmount = sntAmount.toString();
    }

    try {
      await allocate(sntAmount);
      this.setState({ busy: false, successMsg: 'Funds allocated!'});
      this.getAllowance();
      this.getSNTForfeitedBalance();
      this.getRegistryNum();
    } catch (error) {
      this.setState({ error: error.message || error, busy: false });
    }
  };

  approve = async e => {
    e.preventDefault();

    /* eslint-disable-next-line no-alert*/
    if (!confirm('Are you sure?')) return;

    this.setState({ busy: true, successMsg: '', error: '' });

    const { registryNum, sntPerContributor } = this.state;
    const sntAmount = web3.utils.toWei((registryNum * parseInt(sntPerContributor, 10)).toString(), 'ether');

    try {
      await approve(sntAmount);
      this.setState({ 
        busy: false, 
        successMsg: (registryNum.length * parseInt(sntPerContributor, 10)) + ' SNT approved for allocation',
        allowance: sntAmount
      });

      this.getAllowance();
      this.getSNTForfeitedBalance();
      this.getRegistryNum();
    } catch (error) {
      this.setState({ error: error.message || error, busy: false });
    }
  };

  resetAllowance = async e => {
    e.preventDefault();

    /* eslint-disable-next-line no-alert*/
    if (!confirm('Are you sure?')) return;

    this.setState({ busy: true, successMsg: '', error: '' });

    try {
      await resetAllowance();
      this.setState({ busy: false, successMsg: 'Allowance reset to 0', allowance: '0' });
      this.getAllowance();
      this.getSNTForfeitedBalance();
      this.getRegistryNum();
    } catch (error) {
      this.setState({ error: error.message || error, busy: false });
    }
  };

  forfeit = async e => {
    e.preventDefault();

    /* eslint-disable-next-line no-alert*/
    if (!confirm('Are you sure?')) return;

    this.setState({ busy: true, successMsg: '' });
    try {
      await forfeitAllocation();
      await this.getLastForfeitDate();
      await this.getSNTForfeitedBalance();
      await this.getRegistryNum();
      this.setState({ busy: false, successMsg: 'Funds forfeited!' });
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

      await this.getSNTForfeitedBalance();
      this.setState({ contributorList, busy: false, successMsg: 'Contributor removed!' });
    } catch (error) {
      this.setState({ error: error.message || error, busy: false });
    }
  };

  handleClose = () => {
    this.setState({ showDeleteModal: false });
  };

  render() {
    const {
      lastForfeited,
      contributorAddress,
      contributorName,
      error,
      busy,
      contributorList,
      successMsg,
      focusedContributorIndex,
      tab,
      sntPerContributor,
      allowance,
      balance,
      forfeitedBalance,
      registryNum
    } = this.state;
    const currentContributor = focusedContributorIndex > -1 ? contributorList[focusedContributorIndex] : {};
    const nextForfeit = (lastForfeited ? lastForfeited * 1000 : new Date().getTime()) + 86400 * 6 * 1000;
    const nextForfeitDate =
      new Date(nextForfeit).toLocaleDateString() + ' ' + new Date(nextForfeit).toLocaleTimeString();

    const SNTForfeitedBalance = fromWei(forfeitedBalance, "ether");
    const totalSntForContributors = toWei(toBN(SNTForfeitedBalance).add(toBN(registryNum * parseInt(sntPerContributor || '0', 10))).toString(), "ether");
    const userAmount = toWei(toBN(fromWei(totalSntForContributors, "ether")).sub(toBN(SNTForfeitedBalance)), "ether");
    const individualSNTBalance = Math.floor(parseInt(SNTForfeitedBalance, 10) / registryNum);
    
    const enoughBalance = toBN(balance).gte(userAmount);
    const shouldReset = toBN(allowance).gt(toBN(0));
    const canAllocate = toBN(userAmount).gt(toBN(0));

    let amountToApprove = '0';
    if(individualSNTBalance >= 0 && sntPerContributor > 0){
      const totalAmountAllocated = toBN(toWei(individualSNTBalance.toString(), "ether")).add(toBN(toWei(sntPerContributor.toString(), "ether"))).mul(toBN(registryNum));
      amountToApprove = totalAmountAllocated.sub(toBN(forfeitedBalance));
      if(amountToApprove.lt(toBN(0))) amountToApprove = toBN(0);
      amountToApprove = amountToApprove.toString();
    }

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
                  <span className="font-weight-bold">{contributor.label}:</span>{' '}
                  <span className="text-small">{contributor.value}</span>
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
            {error && <Alert variant="danger">{error}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}
            {busy && <Alert variant="primary">Working...</Alert>}
            <ValidatedForm>
              <Form.Group controlId="fundAllocation">
                <Form.Label>SNT per contributor</Form.Label>
                <Form.Text className="text-muted">
                  Total: {web3.utils.fromWei(totalSntForContributors, "ether")} SNT,  (Balance forfeited from previous cycle: {SNTForfeitedBalance}, Your balance: {web3.utils.fromWei(balance, "ether")} SNT, Currently Approved: {web3.utils.fromWei(allowance, "ether")} SNT)
                </Form.Text>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="basic-addon1">{individualSNTBalance} SNT (from contract) +</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Input
                    type="text"
                    placeholder="0"
                    value={sntPerContributor}
                    onChange={e => this.onChange('sntPerContributor', e)}
                    className="form-control"
                    validations={[required, isNumber, higherThan.bind(null, 0)]}
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  {web3.utils.fromWei(amountToApprove, "ether")} SNT will be deducted from your account
                </Form.Text>
              </Form.Group>
              { enoughBalance && canAllocate && !shouldReset && <Button variant="primary" disabled={busy} onClick={this.allocateFunds}>
                Allocate {parseInt(individualSNTBalance || '0', 10) + parseInt(sntPerContributor || '0', 10)} SNT to each contributor
              </Button> }
              { shouldReset && <Button disabled={busy} variant="primary" onClick={this.resetAllowance}>
                Reset existing approval
              </Button> }
            </ValidatedForm>
            <hr className="mt-5 mb-5" />
            <ValidatedForm>
              <Form.Group>
                <Button variant="primary"  onClick={this.forfeit}>
                  Forfeit Allocation
                </Button>
                {lastForfeited && (
                  <Form.Text className="text-muted">
                    Forfeited {moment.unix(lastForfeited).fromNow()}.<br />{' '}
                    {nextForfeit > new Date().getTime() && 'Can be forfeited on ' + nextForfeitDate}
                  </Form.Text>
                )}
              </Form.Group>
            </ValidatedForm>
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
