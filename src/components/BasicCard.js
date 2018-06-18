import React from 'react'
import { Card, CardBody, CardTitle, CardSubtitle } from 'reactstrap'

export default class BasicCard extends React.Component {
    render() {
        return <Card id={this.props.id} className={Boolean(this.props.noAnimation) ? '' : 'Content-card'} style={Boolean(this.props.noAnimation) ? {marginBottom: '0.5rem'} : {}}>
                    <CardBody>
                        <CardTitle>{this.props.title}</CardTitle>
                        {this.props.subtitle ? <CardSubtitle>{this.props.subtitle}</CardSubtitle> : null}
                        <div style={{marginTop: '0.625rem'}}>
                            {this.props.children}
                        </div>
                    </CardBody>
                </Card>
    }
}