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
import React, {useEffect, useState} from "react";
import {
    Badge,
    Button,
    Container,
    Dropdown,
    FormControl,
    InputGroup,
    OverlayTrigger,
    Table,
    Tooltip
} from "react-bootstrap";
import api from "../api";
import PageSpinner from "./PageSpinner";
import dayjs from "dayjs";
import {Link} from "react-router-dom";

export default function AssessmentListPage() {

    const [ assessments, setAssessments ] = useState(null);
    const [ assessmentStatistics, setAssessmentStatistics ] = useState({});
    const [ renameAssessmentId, setRenameAssessmentId ] = useState(null);
    const [ newName, setNewName ] = useState("");

    useEffect(() => {
        api.get("/assessments").then(({json}) => setAssessments(json.content));
        api.get("/assessments/statistics").then(({json}) => setAssessmentStatistics(json));
    }, []);

    if (assessments === null) {
        return <PageSpinner/>
    }

    function assessmentAction(id, action, payload) {
        api.post(`/assessments/${id}/${action}`, payload).then(({json}) =>
            setAssessments(assessments.map(assessment => assessment.id === json.id ? json : assessment))
        ).catch(err => console.log(`Assessment action ${action} error`, err));
    }

    return (
        <Container>
            <h1>Vorgänge</h1>
            <Table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Erfasst</th>
                    <th>Status</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {assessments.map(assessment => <tr key={assessment.id}>
                    <td>
                        {renameAssessmentId !== assessment.id && <Link to={`/assessment/${assessment.id}`}>
                            {assessment.name}</Link>}
                        {renameAssessmentId === assessment.id && <InputGroup>
                            <FormControl value={newName} onChange={e => setNewName(e.target.value)}/>
                            <InputGroup.Append>
                                <Button variant="outline-secondary" onClick={() => {
                                    assessmentAction(assessment.id, 'rename', {name: newName});
                                    setRenameAssessmentId(null)
                                }}>Umbenennen</Button>
                                <Button variant="outline-secondary" onClick={() => setRenameAssessmentId(null)}>Abbruch</Button>
                            </InputGroup.Append>
                        </InputGroup>}
                    </td>
                    <td>
                        {assessmentStatistics[assessment.id] &&
                        `${assessmentStatistics[assessment.id].seen} / ${assessmentStatistics[assessment.id].count}`}
                    </td>
                    <td>
                        <OverlayTrigger overlay={<Tooltip id={"details"}>
                            Erstellt
                            {assessment.createdDate && ` am ${dayjs(assessment.createdDate).format('llll')}`}
                            {assessment.createdBy && ` von ${assessment.createdBy}`}<br/>
                            {assessment.closedDate && `Geschlossen am ${dayjs(assessment.closedDate).format('llll')}`}
                        </Tooltip>}>
                            {assessment.open ? <Badge variant="success">Offen</Badge> : <Badge variant="danger">Abgeschlossen</Badge>}
                        </OverlayTrigger>
                    </td>
                    <td>
                        <Dropdown>
                            <Dropdown.Toggle>Aktionen</Dropdown.Toggle>
                            <Dropdown.Menu>
                                {assessment.open && <Dropdown.Item href={`/assessment/${assessment.id}`}>
                                    Erfassung</Dropdown.Item>}
                                {assessment.open && <Dropdown.Item onClick={() =>
                                    window.confirm("Soll der ausgewählte Vorgang wirklich abgeschlossen werden?")
                                    && assessmentAction(assessment.id, "close")
                                }>Schließen</Dropdown.Item>}
                                {assessment.open || <Dropdown.Item onClick={() =>
                                    assessmentAction(assessment.id, "reopen")
                                }>Erneut öffnen</Dropdown.Item>}
                                <Dropdown.Item onClick={() => {
                                    setNewName(assessment.name);
                                    setRenameAssessmentId(assessment.id);
                                }}>Umbenennen</Dropdown.Item>
                                <Dropdown.Item href={
                                    `${api.contextPath}/api/assessments/${assessment.id}/csv`
                                }>Export</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </td>
                </tr>)}
                </tbody>
            </Table>
        </Container>
    );
}
