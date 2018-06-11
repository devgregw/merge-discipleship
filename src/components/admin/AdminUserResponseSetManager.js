import React from 'react'

export default class AdminUserResponseSetManager extends React.Component {
    render() {
        return <h1>Admin User Response Set Manager {this.props.match.params.user} {this.props.match.params.set}</h1>
    }
}