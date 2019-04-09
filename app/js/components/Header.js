import React from 'react'
import {Navbar, Nav} from 'react-bootstrap';

const Header = () => (<Navbar bg="light" expand="lg">
    <Navbar.Brand href="/#/">Meritocracy</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="mr-auto">
          <Nav.Link href="/#/">Home</Nav.Link>
          <Nav.Link href="/#/admin">Admin</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default Header
