import React from 'react'
import Toolbar from '../Toolbar'
import Utils from '../../Utils'
import BasicCard from '../BasicCard'
import * as firebase from 'firebase'
import * as moment from 'moment'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, FormFeedback, ButtonGroup } from 'reactstrap'
import DatabaseLoader from '../DatabaseLoader'

class DeleteDialog extends React.Component {
    delete() {
        let newHierarchy = this.props.hierarchy.substr(0, this.props.hierarchy.length - 1).split('/').join('/replies/')
        firebase.database().ref('/discipleship/chat/' + newHierarchy).remove()
        this.props.onDismiss()
    }

    render() {
        return <Modal isOpen={this.props.isOpen}>
            <ModalHeader>Delete</ModalHeader>
            <ModalBody>
                <p>Are you sure you want to delete this message and all replies?<br/><br/><b>This action cannot be undone!</b></p>
            </ModalBody>
            <ModalFooter>
                <ButtonGroup>
                    <Button color="dark" outline onClick={this.props.onDismiss}>Cancel</Button>
                    <Button color="danger" onClick={this.delete.bind(this)}>Delete</Button>
                </ButtonGroup>
            </ModalFooter>
        </Modal>
    }
}

class ComposeDialog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            message: false
        }
    }

    post() {
        let message = document.getElementById("message").value
        let anon = document.getElementById("anon").checked
        let result = [
            Boolean(/\S/.test(message))
        ]
        if (result.filter(b => !b).length > 0) {
            this.setState({
                message: !result[0]
            })
            return
        }
        this.setState({
            message: false
        })
        var ref = firebase.database().ref('/discipleship/chat/' + this.props.hierarchy.split('/').join('/replies/')).push()
                var m = moment()
                ref.set({
                    userId: this.props.userInfo.id,
                    firstName: this.props.userInfo.firstName,
                    anon: anon,
                    timestamp: m.valueOf(),
                    date: m.toISOString(),
                    message: message
                })
        this.props.onDismiss()
    }

    render() {
        return <Modal isOpen={this.props.isOpen}>
            <ModalHeader>Compose Message</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                        <Label for="message">Message</Label>
                        <Input type="textarea" invalid={Boolean(this.state.message)} id="message" placeholder="message"/>
                        <FormFeedback>Please enter a message.</FormFeedback>
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input id="anon" type="checkbox" defaultChecked={false}/>{' '}
                            Post Anonymously
                        </Label>
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <ButtonGroup>
                    <Button color="dark" outline onClick={this.props.onDismiss}>Cancel</Button>
                    <Button color="primary" onClick={this.post.bind(this)}>Post</Button>
                </ButtonGroup>
            </ModalFooter>
        </Modal>
    }
}

class ChatViewer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            messages: [],
            loaded: false
        }
        this.update = this.update.bind(this)
    }

    createMessage(value, key, hierarchy) {
        let message = value
        message.key = key
        message.hierarchy = hierarchy + key + '/'
        let replies = value.replies || {}
        message.replies = []
        for (var rkey in replies)
            message.replies.push(this.createMessage(replies[rkey], rkey, message.hierarchy))
        message.replies = message.replies.sort((a, b) => parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10))
        return message
    }

    update(snapshot) {
        var messages = []
        var value = snapshot.val()
        for (var key in value)
            messages.push(this.createMessage(value[key], key, ''))
        this.setState({messages: messages.reverse(), loaded: true})
    }

    componentDidMount() {
        firebase.database().ref('/discipleship/chat').orderByChild("timestamp").on('value', snapshot => this.update(snapshot))
    }

    makeSubtitle(parent, message) {
        return <p onClick={() => window.alert(`Message ID: ${message.key}\nUser ID: ${new Array(7).join("\u2022") + message.userId.substr(6)}\nTimestamp: ${message.timestamp}`)}>{Boolean(parent) ? <span>Replying to {Boolean(parent.anon) ? <em>Anonymous</em> : parent.firstName}.  </span> : ''}Posted on {moment(message.date, moment.ISO_8601).format('dddd, D MMMM, YYYY [at] h:mm A')}.</p>
    }

    makeCard(parent, message) {
        var formatted = []
        var lines = message.message.split('\n')
        lines.forEach((l, i) => {
            formatted.push(l)
            formatted.push(<br/>)
        })
        return <BasicCard id={message.timestamp} noAnimation key={message.timestamp} title={Boolean(message.anon) ? <em>Anonymous</em> : message.firstName} subtitle={this.makeSubtitle(parent, message)}>
            {formatted}
            <Button style={{marginBottom: '0.5rem', paddingLeft: '0'}} color="link" onClick={() => {
                this.props.onCompose(message.hierarchy)
            }}>Reply</Button>
            {message.userId === this.props.userInfo.id ? <Button style={{marginBottom: '0.5rem', paddingLeft: '0', color: 'red'}} color="link" onClick={() => {
                this.props.onDelete(message.hierarchy)
            }}>Delete</Button> : null}
            {(message.replies || []).map(r => this.makeCard(message, r))}
        </BasicCard>
    }

    render() {
        return !this.state.loaded ? "Loading..." : this.state.messages.length === 0 ? <p style={{position: 'absolute', top: '50%', left: '50%', transform: 'translateX(-50%) translateY(-50%)'}}>No messages</p> : this.state.messages.map(m => this.makeCard(null, m))
    }
}

export default class LiveChat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hierarchy: '',
            compose: false,
            delete: false
        }
    }

    onLoad(users) {
        if (Object.getOwnPropertyNames(users).indexOf(this.props.match.params.user) === -1) {
            alert("Error: invalid user ID")
            window.location.replace('/')
            return null
        }
        let userInfo = users[this.props.match.params.user]
        return <div style={{
            background: '#f6f6f6',
            width: '100%',
            height: '100%',
            position: 'absolute'
        }}>
            <Toolbar startOpen title="Live Discussion" items={[Utils.homeToolbarItem(this.props.match.params.user),{text: "Compose", handler: () => this.setState({hierarchy: '', compose: true})}]}/>
            <div style={{padding: '1rem'}}>
                <ChatViewer userInfo={userInfo} onCompose={h => this.setState({hierarchy: h, compose: true})} onDelete={h => this.setState({hierarchy: h, delete: true})}/>
            </div>
            <ComposeDialog userInfo={userInfo} hierarchy={this.state.hierarchy} isOpen={this.state.compose} onDismiss={() => this.setState({hierarchy: '', compose: false})}/>
            <DeleteDialog hierarchy={this.state.hierarchy} isOpen={this.state.delete} onDismiss={() => this.setState({hierarchy: '', delete: false})}/>
        </div>
    }

    render() {
        return <DatabaseLoader path={`/discipleship/users/`} render={this.onLoad.bind(this)}/>
    }
}