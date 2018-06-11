import React from 'react'

export default class AdminQuestionManager extends React.Component {
    render() {
        return <h1>Admin Question Manager {this.props.match.params.set} {this.props.match.params.assignment} {this.props.match.params.question}</h1>
    }
}