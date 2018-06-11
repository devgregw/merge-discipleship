import React from 'react'
import firebase from 'firebase'
import { Progress } from 'reactstrap'
import { Redirect } from 'react-router'

export default class AuthRequired extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            authState: -1
        }
        firebase.auth().onAuthStateChanged(user => {
            this.setState({authState: Boolean(user) ? 1 : 0})
        })
    }

    render() {
        switch (this.state.authState) {
            case -1:
                return <Progress style={{position: 'absolute', top: '50%', left: '50%', width: '66%', transform: 'translateX(-50%) translateY(-50%)'}} color="primary" animated value="100">Authenticating...</Progress>
            case 0: return <Redirect to={`/admin/auth/${window.btoa(this.props.match.url)}`}/>
            case 1: return this.props.render(this.props.match)
            default: return null
        }
    }
}