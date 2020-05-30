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
import SearchField from "./SearchField";
import SearchResults from "./SearchResults";
import api, {ApiError} from "../api";
import {Alert, Button, Col, Container, Dropdown, Row, Tab, Tabs} from "react-bootstrap";
import PageSpinner from "./PageSpinner";
import {Link} from "react-router-dom";
import audio from "../audio";
import AssetSource from "./AssetSource";
import AssetNotes from "./AssetNotes";
import AssessmentHistory from "./AssessmentHistory";
import AssessmentMissing from "./AssessmentMissing";

const MAX_HISTORY_SIZE = 100;

export default class AssessmentPage extends React.Component {

    constructor(props) {
        super(props);
        this.searchInputRef = React.createRef();
        this.state = {
            history: []
        };
    }

    componentDidMount() {
        api.get(`/assessments/${this.props.assessmentId}`).then(({json}) => {
            this.setState({ assessment: json });
        });
        api.get(`/current-user/assessments/${this.props.assessmentId}/seen`).then(({json}) => {
            let history = this.state.history.slice();
            history = history.concat(json.content.map(asset => ({ asset })));
            history = history.slice(0, Math.min(MAX_HISTORY_SIZE, history.length));
            this.setState({ history })
        })
    }

    render() {
        if (!this.state.assessment) {
            return <PageSpinner />;
        }

        if (!this.state.assessment.open) {
            return <Container>
                <h1>
                    {this.state.assessment.name}
                </h1>

                <Alert variant="danger">
                    Der Vorgang ist abgeschlossen, es können keine weiteren Erfassungen mehr durchgeführt werden.
                </Alert>

                <Row>
                    <Col><Link to="/assessment" className={"btn btn-secondary"}>Vorgang wechseln</Link></Col>
                    <Col><a href={`${api.contextPath}/api/assessments/${this.props.assessmentId}/csv`} className={"btn btn-primary"}>Exportieren</a></Col>
                    <Col><Button variant="secondary" onClick={() => this.reopenAssessment()}>Erneut öffnen</Button></Col>
                </Row>
            </Container>;
        }

        return <Container fluid>
            <Row>
                <Col md={9}>
                    <h1>
                        {this.state.assessment.name}
                        <Link to="/assessment" className={"btn btn-link"}>Vorgang wechseln</Link>
                    </h1>
                </Col>
                <Col className="text-right" md={3}>
                    <h1>
                        <Dropdown>
                            <Dropdown.Toggle variant="primary">
                                Vorgangsaktionen
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item href={`${api.contextPath}/api/assessments/${this.props.assessmentId}/csv`}>Exportieren</Dropdown.Item>
                                <Dropdown.Item variant="danger" onClick={() => this.closeAssessment()}>Schließen</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </h1>
                </Col>
            </Row>
            <SearchField mode="assess" inputRef={this.searchInputRef} onResults={results => this.setResults(results)}/>
            {this.state.results && <SearchResults results={this.state.results} onSelect={item => this.onSelect(item)}/>}
            {this.state.itemMessage === "SUCCESS" && <Alert variant="success">Ausstattung erfolgreich erfasst.</Alert>}
            {this.state.itemMessage === "ALREADY_SEEN" && <Alert variant="warning">Ausstattung wurde bereits erfasst!</Alert>}
            {this.state.itemMessage === "NOT_IN_ASSESSMENT" && <Alert variant="danger">Ausstattung ist nicht Teil dieses Vorgangs!</Alert>}
            {this.state.itemMessage === "CLOSED" && <Alert variant="danger">Der Vorgang ist abgeschlossen, es sind keine weiteren Erfassungen mehr möglich!</Alert>}
            {this.state.itemMessage === "ERROR" && <Alert variant="danger">Fehler beim Erfassen der Ausstattung!</Alert>}
            <Row>
                <Col sm={12} md={6} lg={4}>
                    <AssetSource item={this.state.item}/>
                </Col>
                <Col sm={12} md={6} lg={4}>
                    {this.state.item && <AssetNotes assessmentId={this.props.assessmentId} assetId={this.state.item.id}/>}
                </Col>
                <Col sm={12} md={12} lg={4}>
                    <Tabs defaultActiveKey="history">
                        <Tab eventKey="history" title="Zuletzt erfasst">
                            <AssessmentHistory history={this.state.history} onUndo={assetId => this.undo(assetId)} onRedo={assetId => this.redo(assetId)}/>
                        </Tab>
                        <Tab eventKey="missing" title="Nicht erfasst">
                            <AssessmentMissing history={this.state.history} assessmentId={this.props.assessmentId}/>
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </Container>;
    }

    setResults(results) {
        this.setState({
            results
        });
    }

    onSelect(asset) {
        if (asset) {
            api.post(`/assessments/${this.props.assessmentId}/assets/${asset.id}/seen`)
                .then(() => {
                    audio.success();
                    this.searchInputRef.current.focus();
                    this.setState({
                        itemMessage: "SUCCESS",
                        history: this.prependHistory(asset)
                    });
                })
                .catch(err => {
                    audio.error();
                    this.searchInputRef.current.blur();
                    if (err instanceof ApiError) {
                        if (err.res.status === 409) {
                            this.setState({ itemMessage: "ALREADY_SEEN" });
                            return;
                        } else if (err.res.status === 404) {
                            this.setState({ itemMessage: "NOT_IN_ASSESSMENT" });
                            return;
                        } else if (err.res.status === 410) {
                            this.setState({ itemMessage: "CLOSED" });
                            return;
                        }
                    }
                    this.setState({ itemMessage: "ERROR" });
                    console.log(`Failed to mark asset ${asset.id} as seen in assessment ${this.props.assessmentId}`, err);
                })
            ;
        }

        this.setState({
            item: asset
        });
    }

    setHistoryAssetState(assetId, state) {
        this.setState({
            history: this.state.history.map(entry => {
                if (entry.asset.id !== assetId) {
                    return entry;
                }

                return Object.assign({}, entry, state);
            })
        });
    }

    undo(assetId) {
        this.setHistoryAssetState(assetId, { loading: true });
        api.post(
            `/assessments/${this.props.assessmentId}/assets/${assetId}/unseen`
        ).then(() => {
            this.setHistoryAssetState(assetId, { loading: false, reverted: true });
        }).catch(err => {
            this.setHistoryAssetState(assetId, { loading: false });
            console.log("Failed to revert asset history", err);
        });
    }

    redo(assetId) {
        this.setHistoryAssetState(assetId, { loading: true });
        api.post(
            `/assessments/${this.props.assessmentId}/assets/${assetId}/seen`
        ).then(() => {
            this.setHistoryAssetState(assetId, { loading: false, reverted: false });
        }).catch(err => {
            this.setHistoryAssetState(assetId, { loading: false });
            console.log("Failed to redo asset history", err);
        });
    }

    prependHistory(asset) {
        let arr = this.state.history
            .slice(Math.max(this.state.history.length - MAX_HISTORY_SIZE, 0));
        arr.unshift({asset});
        return arr;
    }

    closeAssessment() {
        if (window.confirm("Soll der ausgewählte Vorgang wirklich abgeschlossen werden?")) {
            api.post(`/assessments/${this.props.assessmentId}/close`).then(({json}) => this.setState({
                assessment: json
            })).catch(err => console.log("Close error", err));
        }
    }

    reopenAssessment() {
        api.post(`/assessments/${this.props.assessmentId}/reopen`).then(({json}) => this.setState({
            assessment: json
        })).catch(err => console.log("Reopen error", err));
    }
}
