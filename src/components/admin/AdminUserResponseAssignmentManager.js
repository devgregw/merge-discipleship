import React from 'react'

export default class AdminUserResponseAssignmentManager extends React.Component {
    render() {
        return <h1>Admin User Response Assignment Manager {this.props.match.params.user} {this.props.match.params.set} {this.props.match.params.assignment}</h1>
    }
}