import React from 'react'
import { Redirect } from 'react-router-dom'
import firebase from 'firebase'
import { Progress } from 'reactstrap'

export default class AdminSignOut extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            state: 0
        }
        firebase.auth().onAuthStateChanged(user => {
            if (user)
                firebase.auth().signOut().then(() => this.setState({state: 1}))
            else
                this.setState({state: 1})
        })
    }

    render() {
        switch (this.state.state) {
            case 0: return <Progress style={{position: 'absolute', top: '50%', left: '50%', width: '66%', transform: 'translateX(-50%) translateY(-50%)'}} color="danger" animated value="100">Signing out...</Progress>
            case 1: return <Redirect to="/"/>
            default: return null
        }
    }
}