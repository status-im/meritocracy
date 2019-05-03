import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';

import './header.scss';
import logo from '../../images/logo.png';

const Header = ({ isUserAdmin }) => (
  <Navbar expand="lg" className="header border-bottom mb-3">
    <Navbar.Brand href="#/">
      <img alt="Logo" src={logo} className="mr-3" />
      Status Meritocracy
    </Navbar.Brand>
    {isUserAdmin && (
      <React.Fragment>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#/">Home</Nav.Link>
            <Nav.Link href="#/admin">Admin</Nav.Link>
            <Nav.Link href="#/wall">The Wall</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </React.Fragment>
    )}
  </Navbar>
);

export default Header;
