/*
 * thw-inventory - An inventory query and assessment tool
 * Copyright © 2019 Marco Ziech (marco@ziech.net)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from "react";
import {Accordion, Alert, Button, Card, Col, Row} from "react-bootstrap";
import MultipleResultSelector from "./MultipleResultSelector";

export default class SearchResults extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            item: null,
            multi: true
        };
    }


    componentDidMount() {
        if (this.props.results.body.totalElements === 1) {
            this.select(this.props.results.body.content[0]);
        } else {
            this.select(null);
        }
    }

    render() {

        return <Row>
            <Col sm={12}>
                <Alert variant={this.getVariant()}>
                    <Alert.Heading>
                        <h5>Suche nach {this.props.results.search.typeLabel}: {this.props.results.search.value}</h5>
                        {this.state.item && <h1>{this.state.item.inventoryId} &bull; {this.state.item.description}</h1>}
                    </Alert.Heading>
                    {this.props.results.body.totalElements === 0 && 'Keine Ausstattung gefunden'}
                    {this.props.results.body.totalElements === 1 && 'Ausstattung eindeutig identifiziert'}
                    {this.props.results.body.totalElements > 1 && <Accordion activeKey={this.state.multi ? "0" : null}>
                        <Card>
                            <Card.Header onClick={() => this.setState(Object.assign({}, this.state, {multi: true}))}>
                                <Accordion.Button eventKey="0" as={Button} variant="link">
                                    Die Suche lieferte mehrere Treffer, bitte wählen Sie einen aus oder verfeinern Sie die Suchkriterien:
                                </Accordion.Button>
                            </Card.Header>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body>
                                    <MultipleResultSelector results={this.props.results} onSelect={item => this.select(item)}/>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>}
                </Alert>
            </Col>
        </Row>;
    }

    select(item) {
        this.setState({ item, multi: item === null });
        this.props.onSelect(item);
    }

    getVariant() {
        switch (this.props.results.body.totalElements) {
            case 0: return 'danger';
            case 1: return 'success';
            default: return 'warning';
        }
    }

}
