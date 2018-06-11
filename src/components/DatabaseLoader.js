import React from 'react'
import firebase from 'firebase'
import { Progress } from 'reactstrap'

export default class DatabaseLoader extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            response: null
        }
    }

    render() {
        switch (this.state.response) {
            case null:
                firebase.database().ref(this.props.path).once('value').then(snap => this.setState({response: snap.val()}), error => { alert(JSON.stringify(error)) })
                return <Progress style={{position: 'absolute', top: '50%', left: '50%', width: '66%', transform: 'translateX(-50%) translateY(-50%)'}} color="primary" animated value="100">Loading...</Progress>
            default: return this.props.render(this.state.response)
        }
    }
}