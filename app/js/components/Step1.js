import React, {Fragment} from 'react';
import arrowRight from '../../images/arrow-right.svg';
import ContributorSelection from './ContributorSelection';
import {Button, Form} from 'react-bootstrap';

const Step1 = ({allocation, onChangeAward, onSelectContributor, onClickPlus5, contributorList, selectedContributors, award, isChecked, onClickCheckbox, onClickNext}) => (
<Fragment>
  <ContributorSelection
      allocation={allocation}
      onChangeAward={onChangeAward}
      onSelectContributor={onSelectContributor}
      onClickPlus5={onClickPlus5}
      contributorList={contributorList}
      selectedContributors={selectedContributors}
      award={award}
    />

  <Form.Group>
    <Form.Check type="checkbox" className="TOC pl-5 pr-2 mt-4" checked={isChecked} onChange={onClickCheckbox} label="I understand that I only receive rewards if I spend my entire reward budget." />
  </Form.Group>

  <div className="fixed-bottom bg-white">
    <Button disabled={selectedContributors.length === 0 || !(award > 0)  || !isChecked} onClick={onClickNext} variant="link" className="float-right p-3">Next <img src={arrowRight} alt="" className="ml-2" /></Button>
  </div>
</Fragment>
);

export default Step1;