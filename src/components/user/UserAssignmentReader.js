import React from 'react'
import DatabaseLoader from '../DatabaseLoader'
import Toolbar from '../Toolbar'
import Utils from '../../Utils'
import BasicCard from '../BasicCard'
import { Button, Container, Row, Col, Progress, Input } from 'reactstrap'
import firebase from 'firebase'
import ProgressModal from '../ProgressModal'
import * as moment from 'moment'

class MarkdownReader extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            content: null
        }
    }

    render() {
        if (!this.state.content) {
            firebase.storage().ref(this.props.fileName).getDownloadURL().then(url => window.fetch(url).then(response => response.text().then(str => this.setState({content: str}))))
            return <div class="Inset" style={{width: '100%', height: '150px'}}>
                <Progress style={{position: 'relative', top: '50%', left: '50%', width: '66%', transform: 'translateX(-50%) translateY(-50%)'}} color="primary" animated value="100">Loading...</Progress>
            </div>
        } else {
            let md = require('markdown-it')({
                linkify: true,
                typographer: true
            })
            return <div class="Inset md" dangerouslySetInnerHTML={{__html: md.render(this.state.content)}}/>
        }
    }
}

class Questions extends React.Component {
    createQuestionCard(index, questionInfo, response) {
        return <BasicCard key={questionInfo.id} title={`Question ${index + 1}`} subtitle={questionInfo.question}>
            <Input required readOnly={Boolean(response)} defaultValue={response || null} type={questionInfo.type == "short" ? "text" : "textarea"} id={`q${questionInfo.id}`}/>
        </BasicCard>
    }

    render() {
        let responses = ((this.props.user.responses || {})[this.props.set.id] || {})[this.props.assignment.id] || {}
        return Object.getOwnPropertyNames(this.props.assignment.questions).map(qid => this.props.assignment.questions[qid]).map((questionInfo, index) => this.createQuestionCard(index, questionInfo, Object.getOwnPropertyNames(responses).length > 0 ? responses[questionInfo.id].response : null))
    }
}

export default class UserAssignmentReader extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            submitting: false
        }
    }

    finish(database) {
        let userInfo = database.users[this.props.match.params.user]
        let setInfo = database.sets[this.props.match.params.set]
        let assignmentInfo = setInfo.assignments[this.props.match.params.assignment]
        let questions = Object.getOwnPropertyNames(assignmentInfo.questions).map(qid => assignmentInfo.questions[qid])
        let fields = questions.map(q => document.getElementById(`q${q.id}`))
        if (fields.filter(f => f.validity.valueMissing).length > 0)
            alert('Please respond to all questions.')
        else if (window.confirm('Are you sure you want to submit this assignment?  You won\'t be able to change your responses later.')) {
            this.setState({submitting: true})
            Promise.all(questions.map((q, index) => firebase.database().ref(`/discipleship/users/${userInfo.id}/responses/${setInfo.id}/${assignmentInfo.id}/${q.id}`).set({response: fields[index].value, submitted: moment().toISOString()}))).then(() => window.location.replace(`/${userInfo.id}/${setInfo.id}`))
        }
    }

    onLoad(database) {
        let uid = this.props.match.params.user
        if (!database.users[uid]) {
            window.alert('Error: invalid user ID')
            window.location.replace('/')
            return
        }
        let sid = this.props.match.params.set
        if (!database.sets[sid]) {
            window.alert('Error: invalid set ID')
            window.location.replace(`/${uid}`)
            return
        }
        let userInfo = database.users[uid]
        let setInfo = database.sets[sid]
        let aid = this.props.match.params.assignment
        if (!setInfo.assignments[aid]) {
            window.alert('Error: invalid assignment ID')
            window.location.replace(`/${uid}/${sid}`)
            return
        }
        let assignmentInfo = setInfo.assignments[aid]
        return <div>
            <ProgressModal isOpen={this.state.submitting} progressText="Saving..."/>
            <Toolbar title={`${assignmentInfo.name}: ${assignmentInfo.passage}`} items={[Utils.homeToolbarItem(uid), Utils.backToSetItem(uid, sid)]}/>
            <div className="Inset">
                <h1>Read</h1>
                <MarkdownReader fileName={assignmentInfo.content}/>
                <hr/>
                <h1>Questions</h1>
                <Questions assignment={assignmentInfo} set={setInfo} user={userInfo}/>
                <Button disabled={Object.getOwnPropertyNames(((userInfo.responses || {})[setInfo.id] || {})[assignmentInfo.id] || {}).length > 0} color="success" size="lg" onClick={this.finish.bind(this, database)}>Finish Assignment</Button>
            </div>
        </div>
    }

    render() {
        return <DatabaseLoader path="/discipleship" render={this.onLoad.bind(this)}/>
    }
}