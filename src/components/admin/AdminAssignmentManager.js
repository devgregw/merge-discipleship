import React from 'react'

export default class AdminAssignmentManager extends React.Component {
    render() {
        return <h1>Admin Assignment Manager {this.props.match.params.set} {this.props.match.params.assignment}</h1>
    }
}