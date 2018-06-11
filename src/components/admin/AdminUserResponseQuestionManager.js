import React from 'react'

export default class AdminUserResponseQuestionManager extends React.Component {
    render() {
        return <h1>Admin User Response Question Manager {this.props.match.params.user} {this.props.match.params.set} {this.props.match.params.assignment} {this.props.match.params.question}</h1>
    }
}