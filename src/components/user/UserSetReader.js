import React from 'react'
import DatabaseLoader from '../DatabaseLoader'
import Toolbar from '../Toolbar'
import Utils from '../../Utils'
import BasicCard from '../BasicCard'
import { Button, Container, Row, Col, Progress, Badge } from 'reactstrap'
import firebase from 'firebase'
import * as moment from 'moment'

export default class UserSetReader extends React.Component {
    createAssignmentCard(assignmentInfo, setInfo, userInfo) {
        let endDate = moment(assignmentInfo.endDate, moment.ISO_8601)
        return <BasicCard key={assignmentInfo.id} title={`${assignmentInfo.name}: ${assignmentInfo.passage}`} subtitle={`${Object.getOwnPropertyNames(assignmentInfo.questions).length} question${Object.getOwnPropertyNames(assignmentInfo.questions).length == 1 ? '' : 's'}`}>
            {endDate.isAfter(moment()) ? <h5><Badge color="warning">Due by {endDate.format('dddd, D MMMM, YYYY [at] h:mm A')}</Badge></h5> : <h5><Badge color="danger">Overdue</Badge></h5>}
            <Button color="primary" size="lg" outline onClick={() => window.location.assign(`/${userInfo.id}/${setInfo.id}/${assignmentInfo.id}`)}>Start</Button>
        </BasicCard>
    }

    createCompletedAssignmentCard(assignmentInfo, setInfo, userInfo) {
        return <BasicCard key={assignmentInfo.id} title={`${assignmentInfo.name}: ${assignmentInfo.passage}`} subtitle="Complete">
            <Button color="primary" size="lg" outline onClick={() => window.location.assign(`/${userInfo.id}/${setInfo.id}/${assignmentInfo.id}`)}>Review</Button>
        </BasicCard>
    }

    createUpcomingAssingnmentCard(assignmentInfo) {
        return <BasicCard key={assignmentInfo.id} title={`${assignmentInfo.name}: ${assignmentInfo.passage}`} subtitle={`${Object.getOwnPropertyNames(assignmentInfo.questions).length} question${Object.getOwnPropertyNames(assignmentInfo.questions).length == 1 ? '' : 's'}`}>
            <h5><Badge color="primary">Available on {moment(assignmentInfo.startDate, moment.ISO_8601).format('dddd, D MMMM, YYYY [at] h:mm A')}</Badge></h5>
        </BasicCard>
    }

    createProgressArea(database, setInfo, userInfo) {
        let percentage = (Object.getOwnPropertyNames((userInfo.responses || {})[setInfo.id] || {}).length / Object.getOwnPropertyNames(database.sets[setInfo.id].assignments || {}).length) * 100 || 0
        let assignmentResponses = (userInfo.responses || {})[setInfo.id] || {}

        let allAssignments = database.sets[setInfo.id]['assignments']
        var dates = {}
        Object.getOwnPropertyNames(allAssignments).map(aid => allAssignments[aid]).forEach(assign => dates[assign.id] = moment(assign.endDate, moment.ISO_8601))
        var booleans = []
        Object.getOwnPropertyNames(assignmentResponses).map(aid => {
            let responses = assignmentResponses[aid]
            let qid = Object.getOwnPropertyNames(responses)[0]
            booleans.push(dates[aid].isBefore(moment(responses[qid].submitted, moment.ISO_8601)))
        })
        let overdue = booleans.filter(b => b).length > 0

        return <div>
            {Boolean(setInfo.prize) ? <h4>Complete all assignments before their due dates to receive {setInfo.prize}!</h4> : null}
            <Progress striped animated={percentage === 100} className="Inset" color={percentage === 100 ? 'success' : 'primary'} value={percentage}>{percentage}% complete</Progress>
            {percentage === 100 ? <h5>Congratulations on completing this set!</h5> : null}
            {percentage === 100 && Boolean(setInfo.prize) && !overdue ? <h5>To get your reward, tell Sam or Johnathon you've completed "{setInfo.name}"!</h5> : null}
            {percentage === 100 && Boolean(setInfo.prize) && overdue ? <h5>Unfortunately, you didn't complete all of the assignments on time.</h5> : null}
        </div>
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
        let completedAssignmentIds = Object.getOwnPropertyNames((userInfo.responses || {})[setInfo.id] || {})
        let allAssignments = Object.getOwnPropertyNames(setInfo.assignments || {}).map(id => setInfo.assignments[id])
        let remainingAssignments = allAssignments.map(assign => assign.id).filter(aid => completedAssignmentIds.indexOf(aid) < 0).map(aid => setInfo.assignments[aid])
        let availableAssignments = remainingAssignments.filter(assign => moment().isAfter(moment(assign.startDate, moment.ISO_8601)))
        let upcomingAssignments = remainingAssignments.filter(assign => moment().isBefore(moment(assign.startDate, moment.ISO_8601)))
        let completedAssignments = allAssignments.map(assign => assign.id).filter(aid => completedAssignmentIds.indexOf(aid) >= 0).map(aid => setInfo.assignments[aid])
        return <div>
            <Toolbar title={setInfo.name} items={[Utils.homeToolbarItem(uid)]}/>
            <div className="Inset">
                <h1>Progress</h1>
                {this.createProgressArea(database, setInfo, userInfo)}
                <h1>Assignments</h1>
                {availableAssignments.length == 0 ? 'There are no remaining assignments.' : availableAssignments.map(assignmentInfo => this.createAssignmentCard(assignmentInfo, setInfo, userInfo))}
                <h1>Upcoming Assignments</h1>
                {upcomingAssignments.length === 0 ? 'All assignments are available.' : 'The following assignments will be available soon.'}
                {upcomingAssignments.map(assign => this.createUpcomingAssingnmentCard(assign))}
                <hr/>
                <h1>Completed Assignments</h1>
                {completedAssignments.length == 0 ? 'You haven\'t completed any assignments.' : completedAssignments.map(assignmentInfo => this.createCompletedAssignmentCard(assignmentInfo, setInfo, userInfo))}
            </div>
        </div>
    }

    render() {
        return <DatabaseLoader path="/discipleship" render={this.onLoad.bind(this)}/>
    }
}