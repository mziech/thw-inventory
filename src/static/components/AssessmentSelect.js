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
import Spinner from "react-bootstrap/Spinner";
import {Button, Dropdown, FormControl, InputGroup} from "react-bootstrap";
import api from "../api";

export default class AssessmentSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            selectNew: false,
            newName: '',
            assessments: null,
            selectedAssessment: null
        }
    }


    componentDidMount() {
        api.get("/assessments" + (this.props.onlyOpen ? '?onlyOpen=true' : ''))
            .then(({json}) => {
                this.setState(Object.assign({}, this.state, {
                    loading: false,
                    assessments: json.content
                }))
            })
    }

    render() {
        return <React.Fragment>
            {this.state.loading && <Spinner animation="border"/>}
            {!this.state.loading && !this.state.selectNew && this.renderSelect()}
            {!this.state.loading && this.state.selectNew && this.renderSelectNew()}
        </React.Fragment>;
    }

    renderSelect() {
        return <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
                {this.state.selectedAssessment && this.state.selectedAssessment.name || 'Vorgang auswählen'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item onClick={() => this.setSelectNew(true)}>+ Neuen Vorgang anlegen</Dropdown.Item>
                <Dropdown.Divider/>
                {this.state.assessments.map(assessment => <Dropdown.Item onClick={() => this.onSelect(assessment)}
                                                                   key={assessment.id}>
                    {assessment.name}
                </Dropdown.Item>)}
            </Dropdown.Menu>
        </Dropdown>
    }

    setSelectNew(selectNew) {
        this.setState(Object.assign({}, this.state, { selectNew }));
    }

    onSelect(assessment) {
        this.setState(Object.assign({}, this.state, { selectedAssessment: assessment }));
        this.props.onSelect(assessment.id)
    }

    renderSelectNew() {
        return <InputGroup>
            <InputGroup.Text>Neu:</InputGroup.Text>
            <FormControl value={this.state.newName} onChange={e => this.setState(Object.assign({}, this.state, {newName: e.target.value}))}/>
            <Button variant="outline-secondary" onClick={() => this.createNew()}>OK</Button>
            <Button variant="outline-secondary" onClick={() => this.setSelectNew(false)}>Abbruch</Button>
        </InputGroup>;
    }

    createNew() {
        this.setState(Object.assign({}, this.state, {
            loading: true
        }));
        api.post('/assessments', { name: this.state.newName })
            .then(({ json }) => {
                this.setState({
                    loading: false,
                    selectedAssessment: json,
                    selectNew: false,
                    newName: ''
                });
                this.props.onSelect(json.id);
            }).catch(() => {
                this.setState({
                    loading: false
                });
            })
    }
}