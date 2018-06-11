import React from 'react'

export default class AdminSetManager extends React.Component {
    render() {
        return <h1>Admin Set Manager {this.props.match.params.set}</h1>
    }
}