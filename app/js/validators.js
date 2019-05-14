/*global Web3*/
import React from 'react';
import { Form } from 'react-bootstrap';

export const required = value => {
  if (value.toString().trim().length === 0) {
    return (
      <Form.Control.Feedback type="invalid" className="d-block">
        This field is required
      </Form.Control.Feedback>
    );
  }
};

export const isInteger = value => {
  value = parseFloat(value);
  if (!Number.isInteger(value)) {
    return (
      <Form.Control.Feedback type="invalid" className="d-block">
        This field needs to be an integer
      </Form.Control.Feedback>
    );
  }
};

export const isNumber = value => {
  if (isNaN(value)) {
    return (
      <Form.Control.Feedback type="invalid" className="d-block">
        This field needs to be an number
      </Form.Control.Feedback>
    );
  }
};

export const lowerThan = (max, value) => {
  if (value >= max) {
    return (
      <Form.Control.Feedback type="invalid" className="d-block">
        This field needs to be lower than {max}
      </Form.Control.Feedback>
    );
  }
};

export const lowerEqThan = (max, value) => {
  if (value > max) {
    return (
      <Form.Control.Feedback type="invalid" className="d-block">
        This field needs to be lower or equal than {max}
      </Form.Control.Feedback>
    );
  }
};

export const higherThan = (min, value) => {
  if (value <= min) {
    return (
      <Form.Control.Feedback type="invalid" className="d-block">
        This field needs to be higher than {min}
      </Form.Control.Feedback>
    );
  }
};

export const higherEqThan = (min, value) => {
  if (value < min) {
    return (
      <Form.Control.Feedback type="invalid" className="d-block">
        This field needs to be higher or equal than {min}
      </Form.Control.Feedback>
    );
  }
};

export const isAddress = value => {
  if (!Web3.utils.isAddress(value)) {
    return (
      <Form.Control.Feedback type="invalid" className="d-block">
        This field needs to be a valid Ethereum address
      </Form.Control.Feedback>
    );
  }
};

export const isJSON = value => {
  try {
    JSON.parse(value);
  } catch (error) {
    return (
      <Form.Control.Feedback type="invalid" className="d-block">
        This field needs to be a valid JSON string
      </Form.Control.Feedback>
    );
  }
};
