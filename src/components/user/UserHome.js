import React from 'react'
import DatabaseLoader from '../DatabaseLoader'
import Toolbar from '../Toolbar'
import Utils from '../../Utils'
import BasicCard from '../BasicCard'
import { Button } from 'reactstrap'

export default class UserHome extends React.Component {
    createNewCard(set, uid) {
        let count = (set.assignments ? Object.getOwnPropertyNames(set.assignments) : []).length
        return <BasicCard key={set.id} title={set.name} subtitle={`${count} assignment${count === 1 ? '' : 's'}`}>
            <Button color="primary" size="lg" outline onClick={() => window.location.assign(`/${uid}/${set.id}`)}>Start</Button>
        </BasicCard>
    }

    createResumeCard(set, userInfo) {
        let count = this.getRemainingAssignments(set, userInfo)
        let totalAssignments = set.assignments ? Object.getOwnPropertyNames(set.assignments) : []
        return <BasicCard key={set.id} title={set.name} subtitle={`${count} remaining assignment${count === 1 ? '' : 's'} (${totalAssignments.length} total)`}>
            <Button color="primary" size="lg" outline onClick={() => window.location.assign(`/${userInfo.id}/${set.id}`)}>Resume</Button>
        </BasicCard>
    }

    createCompletedCard(set, userInfo) {
        //let totalAssignments = set.assignments ? Object.getOwnPropertyNames(set.assignments) : []
        return <BasicCard key={set.id} title={set.name} subtitle="Complete">
            <Button color="primary" size="lg" outline onClick={() => window.location.assign(`/${userInfo.id}/${set.id}`)}>Review</Button>
        </BasicCard>
    }

    getRemainingAssignments(setInfo, userInfo) {
        let totalAssignments = setInfo.assignments ? Object.getOwnPropertyNames(setInfo.assignments) : []
        let completedAssignments = Object.getOwnPropertyNames(userInfo.responses[setInfo.id])
        return totalAssignments.length - completedAssignments.length
    }

    onLoad(database) {
        let uid = this.props.match.params.user
        if (!database.users[uid]) {
            window.alert('Error: invalid user ID')
            window.location.replace('/')
            return
        }
        let userInfo = database.users[uid]
        let joinedSets = userInfo.responses ? Object.getOwnPropertyNames(userInfo.responses).map(id => database.sets[id]).filter(set => Boolean(set)) : []
        let otherSets = database.sets ? Object.getOwnPropertyNames(database.sets).filter(id => joinedSets.map(set => set.id).indexOf(id) < 0).map(id => database.sets[id]) : []
        let completedSets = joinedSets.filter(set => this.getRemainingAssignments(set, userInfo) === 0)
        return <div style={{
            background: '#f6f6f6'
        }}>
            <Toolbar title={`Hey, ${userInfo.firstName}!`} items={[Utils.signOutToolbarItem]}/>
            <div className="Inset">
                <BasicCard title="Discussion" subtitle="Share your thoughts and ask questions!">
                    <Button color="primary" size="lg" outline onClick={() => window.location.assign(`/${userInfo.id}/chat`)}>Open Discussion Board</Button>
                </BasicCard>
                <h3>Pick Up Where You Left Off</h3>
                <p>{joinedSets.filter(set => this.getRemainingAssignments(set, userInfo) > 0).length === 0 ? 'You haven\'t started any study sets.' : joinedSets.filter(set => this.getRemainingAssignments(set, userInfo) > 0).map(set => this.createResumeCard(set, userInfo))}</p>
                <h3>Start a New Study Set</h3>
                <p>{otherSets.length === 0 ? 'There are no sets available now.' : otherSets.map(set => this.createNewCard(set, uid))}</p>
                <hr/>
                <h3>Completed Sets</h3>
                <p>{completedSets.length === 0 ? 'You haven\'t completed any study sets.' : completedSets.map(set => this.createCompletedCard(set, userInfo))}</p>
            </div>
        </div>
    }

    render() {
        return <DatabaseLoader path="/discipleship" render={this.onLoad.bind(this)}/>
    }
}