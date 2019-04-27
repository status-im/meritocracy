/* global web3 */
import React, { Fragment } from 'react';
import { Row, Col, Button, Container } from 'react-bootstrap';
import moment from 'moment';
import info from '../../images/red-info.svg';
import Address from './Address';

import './withdrawal.scss';

const Withdrawal = ({ totalReceived, allocation, onClick, contributorList, praises }) => (
  <Fragment>
    <div className="text-center p-4">
      <p className="text-muted mb-0 mt-5">You have been awarded</p>
      <p className="awarded mb-0">
        {totalReceived || 0} <span className="text-muted">SNT</span>
      </p>
      <p className="text-muted">Available for withdraw</p>
    </div>

    <Container>
      {praises &&
        praises.map((item, i) => {
          const name = contributorList.find(x => x.value === item.author);
          const date = moment.unix(item.time).fromNow();
          return (
            <Row key={i}>
              <Col className="mb-4 text-muted">
                {!item.praise && (
                  <Fragment>
                    {(name && name.label) || <Address value={item.author} compact={true} />} has sent you{' '}
                    {web3.utils.fromWei(item.amount, 'ether')} SNT <small>{date}</small>
                  </Fragment>
                )}

                {item.praise && (
                  <Fragment>
                    {(name && name.label) || item.author}, <small>{date}</small>
                    <div className="chatBubble p-3">
                      &quot;{item.praise}&quot;
                      <small className="float-right">{web3.utils.fromWei(item.amount, 'ether')} SNT</small>
                    </div>
                  </Fragment>
                )}
              </Col>
            </Row>
          );
        })}
    </Container>

    <p className="text-center">
      <Button
        variant={allocation !== '0' || totalReceived === '0' ? 'secondary' : 'primary'}
        onClick={onClick}
        disabled={allocation !== '0' || totalReceived === '0'}
      >
        Withdraw
      </Button>
    </p>

    {allocation !== '0' && (
      <div className="text-muted text-left border rounded p-2 mb-2 learn-more">
        <img src={info} alt="" />
        <p className="m-0 p-0">
          Your budget wasn’t fullly rewarded to others. Note that you can only withdraw your own reward if you’ve spend
          your full budget to reward others.
        </p>
      </div>
    )}
  </Fragment>
);

export default Withdrawal;
