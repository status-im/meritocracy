import React from 'react';
import { Button, Form } from 'react-bootstrap';
import arrowLeft from '../../images/arrow-left.svg';

const Step2 = ({ selectedContributors, award, praise, onChangeNote, onClickBack, onClickAward }) => (
  <div>
    <p className="text-center mt-5 text-muted">
      Research shows that a note of praise and learning how much our work helped others, increases motivation.
    </p>
    <p className="mb-0">
      <span className="font-weight-bold">{selectedContributors.map(x => x.label).join(', ')}</span>
      <span className="float-right text-muted">
        SNT <b>{award * selectedContributors.length}</b>
      </span>
    </p>
    <Form>
      <Form.Label className="small-text">Add note</Form.Label>
      <Form.Control as="textarea" rows="5" onChange={onChangeNote} value={praise} className="p-2" />
    </Form>
    <div className="fixed-bottom bg-white">
      <Button onClick={onClickBack} variant="link">
        <img src={arrowLeft} alt="" className="mr-2" /> Back
      </Button>
      <Button variant="primary" className="float-right mr-2 mb-2" onClick={onClickAward}>
        Award
      </Button>
    </div>
  </div>
);

export default Step2;
