import React from 'react'
import {
    Button,
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    Collapse
} from 'reactstrap'

export default class Toolbar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            navToggle: false
        }
    }

    render() {
        return <Navbar color="dark" sticky="top" dark expand="md">
        <NavbarBrand href="/">{this.props.title}</NavbarBrand>
        <NavbarToggler onClick={() => this.setState({navToggle: !this.state.navToggle})}/>
        <Collapse isOpen={this.state.navToggle} navbar>
            <Nav className="ml-auto" navbar>
                {this.props.items.map(i => <Button active color="light" style={{margin: '1.5px'}} onClick={i.handler} key={i.text}>{i.text}</Button>)}
            </Nav>
        </Collapse>
</Navbar>
    }
}