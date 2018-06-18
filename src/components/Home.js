import React from 'react'
import {
    Button,
    Form,
    FormGroup,
    Input,
    Card,
    CardBody,
    CardTitle,
    Alert,
    ButtonGroup
} from 'reactstrap'
import RegistrationDialog from './RegistrationDialog'
import ProgressDialog from './ProgressModal'
import firebase from 'firebase'

export default class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            reg: false,
            loading: false,
            error: ""
        }
    }

    signIn() {
        this.setState({loading: true})
        firebase.database().ref('/discipleship/users').once('value').then(snap => {
            if (!snap.exists()) {
                this.setState({loading: false, error: "We couldn't find an account with that email address.  If you don't have an account, tap Register."})
                return
            }
            let val = snap.val()
            let ids = Object.getOwnPropertyNames(val)
            let addresses = Object.getOwnPropertyNames(val).map(id => val[id].emailAddress)
            let index = addresses.indexOf(document.getElementById("email").value)
            if (index < 0) {
                this.setState({loading: false, error: "We couldn't find an account with that email address.  If you don't have an account, tap Register."})
            } else {
                window.location.replace(`/${ids[index]}`)
            }
        })
    }

    render() {
        return (
            <div style={{
                    background: '#eee',
                    width: '100%',
                    height: '100%',
                    position: 'absolute'
                }}>
                <Card className="Auth-card">
                    <CardBody>
                        <CardTitle>Sign In</CardTitle>
                        <Form style={{
                                marginTop: '5px'
                            }}>
                            <Alert color="danger" isOpen={Boolean(this.state.error)}>
                                {this.state.error.toString()}
                            </Alert>
                            <FormGroup>
                                <Input type="email" id="email" placeholder="email address"/>
                            </FormGroup>
                        </Form>
                        <ButtonGroup>
                        <Button id="button" color="primary" onClick={this
                                .signIn
                                .bind(this)}>Sign in</Button>
                        <Button id="button" color="dark" onClick={() => this.setState({reg: true})}>Register</Button>
                        </ButtonGroup><br/>
                        <Button id="button" color="link" onClick={() => window.location.replace('/admin')}>Admin Sign In</Button>
                    </CardBody>
                </Card>
                <RegistrationDialog isOpen={this.state.reg} onCancel={() => this.setState({reg: false})} beginLoading={() => this.setState({regLoading: true})}/>
                <ProgressDialog isOpen={this.state.regLoading} progressText="Configuring your account..."/>
                <ProgressDialog isOpen={this.state.loading} progressText="Finding your account..."/>
            </div>)
    }
}