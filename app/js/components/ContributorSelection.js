import React, {Fragment} from 'react';
import Select from 'react-select';
import {Form} from 'react-bootstrap';
import Allocation from './Allocation';
import statusLogo from '../../images/status-logo.svg';

import "./contributor-selector.scss";

const sortByAlpha = (a,b) => {
  if (a.label < b.label) return -1;
  if (a.label > b.label) return 1;
  return 0;
}

const ContributorSelection = ({allocation, contributorList, selectedContributors, onSelectContributor, onChangeAward, onClickPlus5, award}) => (
  <Fragment>
    <Allocation value={allocation - award * selectedContributors.length} />
    <div className="container">
      <div className="row mb-2">
        <div className="col-10 label">
          Enter contributors and award SNT
        </div>
        <div className="col-2">
          <div className="plus-5" title="Add +5" onClick={onClickPlus5}>
            <img alt="+5" src={statusLogo} />
            <span>+5</span>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-10">
          <Select
            isMulti
            value={selectedContributors}
            onChange={onSelectContributor}
            options={contributorList.sort(sortByAlpha)}
            placeholder="Choose Contributor(s)..."
            className="mb-2 contributorSelector"
            theme={(theme) => ({
              ...theme,
              borderRadius: '4px',
              border: 'none',
              padding: '10px',
              colors: {
              ...theme.colors,
                neutral0: '#EEF2F5',
                neutral10: '#EEF2F5',
              },
              spacing: {
                ...theme.spacing,
                controlHeight: 50,
              }
            })}
          />
        </div>
        <div className="col-2 p-0">
          <Form.Control
            type="number"
            step="1"
            onChange={onChangeAward}
            value={award}
          />
        </div>
      </div>
    </div>    
  </Fragment>
);

export default ContributorSelection;
