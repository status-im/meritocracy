import React from 'react';
import ErrorIcon from '../../images/error.png';
import {Button} from 'react-bootstrap';

const Error = ({onClick, title, message}) => (
  <div className="text-center mt-5 pt-5">
    <img src={ErrorIcon} alt="" width="160" height="160" className="mt-5" />
    <h4 className="text-center pr-5 pl-5 mt-3">{title}</h4>
    <p className="text-muted">{message}</p>
    <p><Button onClick={onClick} variant="link">Back</Button></p>
  </div>
)

export default Error;
