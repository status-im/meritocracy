/* global web3 */
import React, { Fragment } from 'react';
import moment from 'moment';
import Address from './Address';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

const Praise = ({ contributorList, item, individual }) => {
  const name = contributorList.find(x => x.value.toLowerCase() === item.from.toLowerCase());
  const date = moment.unix(item.timestamp).fromNow();

  const destination = item.to.map(x => {
    const name = contributorList.find(y => y.value.toLowerCase() === x.toLowerCase());
    return name ? name.label : x;
  });

  return (
    <Row>
      <Col className="mb-4 text-muted">
        {!item.praise && (
          <Fragment>
            {(name && name.label) || <Address value={item.from} compact={true} />}{' '}
            {individual ? 'has sent you' : 'sent'} {web3.utils.fromWei(item.amount, 'ether')} SNT{' '}
            {!individual && <span>to {destination.join(', ')}</span>}, <small>{date}</small>
          </Fragment>
        )}

        {item.praise && (
          <Fragment>
            {(name && name.label) || <Address value={item.from} compact={true} />}
            {!individual && <span> to {destination.join(', ')}</span>}, <small>{date}</small>
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

Praise.propTypes = {
  contributorList: PropTypes.array,
  individual: PropTypes.bool,
  item: PropTypes.object
};

export default Praise;
