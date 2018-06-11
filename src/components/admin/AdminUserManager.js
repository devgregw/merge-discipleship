import React from 'react'

export default class AdminUserManager extends React.Component {
    render() {
        return <h1>Admin User Manager {this.props.match.params.user}</h1>
    }
}