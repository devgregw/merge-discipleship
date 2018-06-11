import React from 'react'
import BasicCard from '../BasicCard'
import Toolbar from '../Toolbar'
import DatabaseLoader from '../DatabaseLoader'

export default class Admin extends React.Component {
    asArray(object) {
        return Object.getOwnPropertyNames(object).map(n => object[n])
    }

    onLoad(database) {

        return <div>
            <Toolbar/>
                <div className="Inset">
                <h1>Sets</h1>
                {this.asArray(database.sets).map(s => <BasicCard key={s.id} title={s.name} subtitle={s.id}><p>{Object.getOwnPropertyNames(s.assignments).count} assignments</p></BasicCard>)}
                <h1>Users</h1>
            </div>
        </div>
    }

    render() {
        return <DatabaseLoader path="/discipleship" render={this.onLoad.bind(this)}/>
    }
}