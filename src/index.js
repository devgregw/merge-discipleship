import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import firebase from 'firebase'
//import Components from './Exports'

import AuthRequired from './components/AuthRequired'
import Home from './components/Home'
import DatabaseLoader from './components/DatabaseLoader'

import Admin from './components/admin/Admin'
import AdminAssignmentManager from './components/admin/AdminAssignmentManager'
import AdminQuestionManager from './components/admin/AdminQuestionManager'
import AdminSetManager from './components/admin/AdminSetManager'
import AdminSignOut from './components/admin/AdminSignOut'
import AdminUserManager from './components/admin/AdminUserManager'
import AdminUserResponseAssignmentManager from './components/admin/AdminUserResponseAssignmentManager'
import AdminUserResponseManager from './components/admin/AdminUserResponseManager'
import AdminUserResponseQuestionManager from './components/admin/AdminUserResponseQuestionManager'
import AdminUserResponseSetManager from './components/admin/AdminUserResponseSetManager'
import AdminAuthentication from './components/admin/AdminAuthentication'

import UserAssignmentReader from './components/user/UserAssignmentReader'
import UserSetReader from './components/user/UserSetReader'
import UserHome from './components/user/UserHome'

import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

firebase.initializeApp({
    apiKey: "AIzaSyC5tIbjfLfTuLRVbFrP6mXdcx9sHYjRmOE",
    authDomain: "the-merge-app.firebaseapp.com",
    databaseURL: "https://the-merge-app.firebaseio.com",
    projectId: "the-merge-app",
    storageBucket: "the-merge-app.appspot.com",
    messagingSenderId: "169785425357"
})

class AuthorizedRoute extends React.Component {
    render() {
        return <Route path={this.props.path} exact={this.props.exact} render={({match}) => <AuthRequired match={match} render={match => this.props.render(match)}/>}/>
    }
}

ReactDOM.render(
<Router>
    <div>
        <Switch>
            <Route path="/" exact component={Home}/>
            <AuthorizedRoute path="/admin" exact render={match => <Admin match={match}/>}/>
            <Route path="/admin/auth/:return" exact component={AdminAuthentication}/>
            <Route path="/admin/signout" exact component={AdminSignOut}/>
            <AuthorizedRoute path="/admin/sets/:set" exact render={match => <AdminSetManager match={match}/>}/>
            <AuthorizedRoute path="/admin/sets/:set/:assignment" exact render={match => <AdminAssignmentManager match={match}/>}/>
            <AuthorizedRoute path="/admin/sets/:set/:assignment/:question" exact render={match => <AdminQuestionManager match={match}/>}/>
            <AuthorizedRoute path="/admin/users/:user" exact render={match => <AdminUserManager match={match}/>}/>
            <AuthorizedRoute path="/admin/users/:user/responses" exact render={match => <AdminUserResponseManager match={match}/>}/>
            <AuthorizedRoute path="/admin/users/:user/responses/:set" exact render={match => <AdminUserResponseSetManager match={match}/>}/>
            <AuthorizedRoute path="/admin/users/:user/responses/:set/:assignment" exact render={match => <AdminUserResponseAssignmentManager match={match}/>}/>
            <AuthorizedRoute path="/admin/users/:user/responses/:set/:assignment/:question" exact render={match => <AdminUserResponseQuestionManager match={match}/>}/>
            <Route path="/:user" exact component={UserHome}/>
            <Route path="/:user/:set" exact component={UserSetReader}/>
            <Route path="/:user/:set/:assignment" exact component={UserAssignmentReader}/>
        </Switch>
    </div>
</Router>
, document.getElementById('root'));
registerServiceWorker();
