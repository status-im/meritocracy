import React from 'react';
import './loading.scss';
import spinner from '../../images/spinner.png';

const Loading = () => (
  <div className="busy text-center mt-5 pt-5">
    <img src={spinner} alt="" className="mt-5" />
    <h5 className="text-muted text-center pr-5 pl-5">Waiting for the confirmation from miners</h5>
  </div>
)

export default Loading;
