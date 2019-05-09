/* global web3 */
import React, { Fragment } from 'react';
import moment from 'moment';
import Address from './Address';
import { Row, Col } from 'react-bootstrap';

const Praise = ({ contributorList, item, individual }) => {
  const name = contributorList.find(x => x.value === item.author);
  const date = moment.unix(item.time).fromNow();
  return (
    <Row>
      <Col className="mb-4 text-muted">
        {!item.praise && (
          <Fragment>
            {(name && name.label) || <Address value={item.author} compact={true} />}{' '}
            {individual ? 'has sent you' : 'sent'} {web3.utils.fromWei(item.amount, 'ether')} SNT{' '}
            {!individual && <span>to {item.destination}</span>}, <small>{date}</small>
          </Fragment>
        )}

        {item.praise && (
          <Fragment>
            {(name && name.label) || <Address value={item.author} compact={true} />}
            {!individual && <span> to {item.destination}</span>}, <small>{date}</small>
            <div className="chatBubble p-3">
              &quot;{item.praise}&quot;
              <small className="float-right">{web3.utils.fromWei(item.amount, 'ether')} SNT</small>
            </div>
          </Fragment>
        )}
      </Col>
    </Row>
  );
};

export default Praise;
