import React, { Fragment } from 'react';
import { Button, Container } from 'react-bootstrap';
import info from '../../images/red-info.svg';
import Praise from './Praise';

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
        praises.map((item, i) => <Praise key={i} individual={true} contributorList={contributorList} item={item} />)}
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
    
    {totalReceived !== '0' && parseInt(allocation, 10) > 0 && (
      <div className="text-muted text-left border rounded p-2 mb-2 learn-more">
        <img src={info} alt="" />
        <p className="m-0 p-0">
          Your budget wasn’t fully rewarded to others. Note that you can only withdraw your own reward if you’ve spend
          your full budget to reward others.
        </p>
      </div>
    )}
  </Fragment>
);

export default Withdrawal;
