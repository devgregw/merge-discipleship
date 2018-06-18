import React from 'react'
import DatabaseLoader from '../DatabaseLoader'
import Toolbar from '../Toolbar'
import Utils from '../../Utils'
import BasicCard from '../BasicCard'
import { Button, Progress, Input, Badge } from 'reactstrap'
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
            <Input required readOnly={Boolean(response)} defaultValue={Boolean(response) ? response.response : null} type={questionInfo.type === "short" ? "text" : "textarea"} id={`q${questionInfo.id}`}/>
            {Boolean(response) ? <Badge color="success" pill>Submitted on {moment(response.submitted, moment.ISO_8601).format('dddd, D MMMM, YYYY [at] h:mm A')}</Badge> : null}
        </BasicCard>
    }

    render() {
        let questions = Object.getOwnPropertyNames(this.props.assignment.questions).map(id => this.props.assignment.questions[id])
        let availableQuestions = questions.filter(q => moment(q.startDate, moment.ISO_8601).isBefore(moment()))
        console.log(availableQuestions)
        let upcomingQuestions = questions.filter(q => moment(q.startDate, moment.ISO_8601).isAfter(moment()))
        console.log(upcomingQuestions)
        let responses = ((this.props.user.responses || {})[this.props.set.id] || {})[this.props.assignment.id] || {}
        return <div className="Inset">
            {availableQuestions.length > 0 ? availableQuestions.map((questionInfo, index) => this.createQuestionCard(index, questionInfo, Object.getOwnPropertyNames(responses).length > 0 ? responses[questionInfo.id] : null)) : null}
            {upcomingQuestions.length > 0 ? <p style={{fontSize: 'large'}}>More questions will become available on {upcomingQuestions.map((q, i) => <span><Badge color="primary" pill>{moment(q.startDate, moment.ISO_8601).format('dddd, D MMMM, YYYY [at] h:mm A')}</Badge>{i === upcomingQuestions.length - 2 ? ', and ' : i === upcomingQuestions.length - 1 ? '' : ', '}</span>)}.<br/>You must answer all questions to complete the assignment.</p> : <p style={{fontSize: 'large'}}>All questions are available.<br/>You must answer all questions to complete the assignment.</p>}
        </div>
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
        if (!window.confirm('Are you sure you want to save your progress now?  You won\'t be able to edit your responses to the questions you completed.'))
            return
        let userInfo = database.users[this.props.match.params.user]
        let setInfo = database.sets[this.props.match.params.set]
        let assignmentInfo = setInfo.assignments[this.props.match.params.assignment]
        let questions = Object.getOwnPropertyNames(assignmentInfo.questions).map(qid => assignmentInfo.questions[qid])
        let responses = questions.map(q => {return{qid: q.id, input: document.getElementById(`q${q.id}`)}}).filter(r => Boolean(r.input)).filter(r => /\S/.test(r.input.value))
        this.setState({submitting: true})
        Promise.all(responses.map((r, index) => firebase.database().ref(`/discipleship/users/${userInfo.id}/responses/${setInfo.id}/${assignmentInfo.id}/${r.qid}`).set({response: r.input.value, submitted: moment().toISOString()}))).then(() => window.location.replace(`/${userInfo.id}/${setInfo.id}`))
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
            </div>
            <div style={{background: 'linear-gradient(white, #eee, white)'}}>
                <h1 className="Inset">Questions</h1>
                <Questions assignment={assignmentInfo} set={setInfo} user={userInfo}/>
                <Button className="Inset" color="success" size="lg" onClick={this.finish.bind(this, database)}>Save Progress</Button>
            </div>
        </div>
    }

    render() {
        return <DatabaseLoader path="/discipleship" render={this.onLoad.bind(this)}/>
    }
}