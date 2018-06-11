import React from 'react'

export default class AdminUserResponseManager extends React.Component {
    render() {
        return <h1>Admin User Response Manager {this.props.match.params.user}</h1>
    }
}