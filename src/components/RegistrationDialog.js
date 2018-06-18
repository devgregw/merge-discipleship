import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, FormFeedback, FormText, ButtonGroup } from 'reactstrap'
import firebase from 'firebase'
import Utils from '../Utils'

export default class RegistrationDialog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            fname: false,
            lname: false,
            email: false
        }
    }

    register() {
        let fname = document.getElementById("fname").value
        let lname = document.getElementById("lname").value
        let email = document.getElementById("r_email")
        let result = [
            Boolean(fname),
            Boolean(lname),
            Boolean(email.value) && Boolean(email.validity.valid)
        ]
        if (result.filter(b => !b).length > 0) {
            this.setState({
                fname: !result[0],
                lname: !result[1],
                email: !result[2]
            })
            return
        }
        this.props.beginLoading()
        this.setState({
            fname: false,
            lname: false,
            email: false
        })
        let id = Utils.id
        firebase.database().ref(`/discipleship/users`).once('value').then(snap => {
            let completionHandler = () => firebase.database().ref(`/discipleship/users/${id}`).set({
                firstName: fname,
                lastName: lname,
                emailAddress: email.value,
                id: id
            }).then(() => window.location.replace(`/${id}`))
            if (!snap.exists()) {
                completionHandler()
                return
            }
            let val = snap.val()
            let ids = Object.getOwnPropertyNames(val)
            let addresses = Object.getOwnPropertyNames(val).map(id => val[id].emailAddress)
            let index = addresses.indexOf(email.value)
            if (index < 0)
                completionHandler()
            else if (window.confirm("An account with this email address already exists.  Would you like to sign in?"))
                window.location.replace(`/${ids[index]}`)
            else
                window.location.reload()
        })
    }

    render() {
        return <div>
            <Modal isOpen={this.props.isOpen}>
            <ModalHeader>Registration</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                        <Label for="fname">First Name</Label>
                        <Input invalid={Boolean(this.state.fname)} id="fname" placeholder="first name"/>
                        <FormFeedback>Please type your first name.</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label for="lname">Last Name</Label>
                        <Input invalid={Boolean(this.state.lname)} id="lname" placeholder="last name"/>
                        <FormFeedback>Please type your last name.</FormFeedback>
                    </FormGroup>
                    <hr/>
                    <FormGroup>
                        <Label for="r_email">Email Address</Label>
                        <Input invalid={Boolean(this.state.email)} type="email" id="r_email" placeholder="email address"/>
                        <FormFeedback>Please type your email address.</FormFeedback>
                        <FormText>We only use this to associate your data to you and sign you in.</FormText>
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <ButtonGroup>
                    <Button color="dark" outline onClick={this.props.onCancel}>Cancel</Button>
                    <Button color="primary" onClick={this.register.bind(this)}>Register</Button>
                </ButtonGroup>
            </ModalFooter>
        </Modal>
        </div>
    }
}