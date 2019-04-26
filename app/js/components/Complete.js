import React from 'react';
import CompleteIcon from '../../images/complete.png';
import {Button} from 'react-bootstrap';

const Complete = ({onClick}) => (
  <div className="text-center mt-5 pt-5">
    <img src={CompleteIcon} alt="" width="160" height="160" className="mt-5" />
    <h4 className="text-center pr-5 pl-5 mt-3">Thank you</h4>
    <p className="text-muted">Your SNT has been awarded.</p>
    <p><Button onClick={onClick} variant="link">Back</Button></p>
  </div>
)

export default Complete;
