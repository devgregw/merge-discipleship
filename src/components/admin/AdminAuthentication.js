import React from 'react'
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Card,
    CardBody,
    CardTitle,
    CardSubtitle,
    Alert
} from 'reactstrap'
import firebase from 'firebase'

export default class AdminAuthentication extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: false,
            authState: 0
        }
    }

    setFieldsDisabled(val) {
        var e = document.getElementById('email'),
            p = document.getElementById('password'),
            r = document.getElementById('remember'),
            b = document.getElementById('button')
        e.disabled = val
        p.disabled = val
        r.disabled = val
        b.disabled = val
        b.innerText = val
            ? 'Signing in...'
            : 'Sign in'
    }

    signIn() {
        var e = document.getElementById('email'),
            p = document.getElementById('password'),
            r = document.getElementById('remember')
        this.setFieldsDisabled(true)

        firebase
            .auth()
            .setPersistence(firebase.auth.Auth.Persistence[
                r.checked
                    ? 'LOCAL'
                    : 'SESSION'
            ])
            .then(() => {
                firebase
                    .auth()
                    .signInWithEmailAndPassword(e.value,
                        p.value
                    )
                    .then(() => {
                        window
                            .location
                            .replace(this.props.match.params.return ? window.atob(this.props.match.params.return) : '/')
                    },
                        reason => {
                        this.setState({error: reason})
                        this.setFieldsDisabled(false)
                        p.value = ''
                    }
                    )
            },
                reason => {
                this.setState({error: reason})
                this.setFieldsDisabled(false)
                p.value = ''
            }
            )
}

    render() {
        var pwd = <Input innerRef={x => {
            (x || document.getElementById('password')).onkeypress = e => {
                if (e.keyCode === 13) {
                    this
                        .signIn
                        .bind(this)()
                    return false
                }
                return true
            }
}} type="password" id="password" placeholder="password"/>
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
                        <CardSubtitle>This page is protected.</CardSubtitle>
                        <Form style={{
                                marginTop: '5px'
                            }}>
                            <Alert color="danger" isOpen={Boolean(this.state.error)}>
                                {this.state.error.toString()}
                            </Alert>
                            <FormGroup>
                                <Input type="email" id="email" placeholder="email address"/>
                            </FormGroup>
                            <FormGroup>
                                {pwd}
                            </FormGroup>
                            <FormGroup check>
                                <Label check>
                                    <Input id="remember" type="checkbox"/>{' '}
                                    Remember me
                                </Label>
                            </FormGroup>
                        </Form>
                        <Button id="button" color="primary" onClick={this
                                .signIn
                                .bind(this)}>Sign in</Button>
                    </CardBody>
                </Card>
            </div>
        )
    }
}