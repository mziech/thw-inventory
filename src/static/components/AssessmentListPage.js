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
import AssessmentSelect from "./AssessmentSelect";
import {Badge, Button, Container, Table} from "react-bootstrap";
import {useHistory} from "react-router";
import {useSessionStorage} from "../hooks";
import api from "../api";
import PageSpinner from "./PageSpinner";

export default function AssessmentListPage() {
    const history = useHistory();
    const [ sessionAssessmentId, setSessionAssessmentId ] = useSessionStorage("assessmentId");
    const [ assessments, setAssessments ] = useState(null);
    const [ assessmentStatistics, setAssessmentStatistics ] = useState({});

    useEffect(() => {
        api.get("/assessments").then(({json}) => setAssessments(json.content));
        api.get("/assessments/statistics").then(({json}) => setAssessmentStatistics(json));
    }, []);

    if (assessments === null) {
        return <PageSpinner/>
    }

    function assessmentAction(id, action) {
        api.post(`/assessments/${id}/${action}`).then(({json}) =>
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
                {assessments.map(assessment => <tr>
                    <td>{assessment.name}</td>
                    <td>
                        {assessmentStatistics[assessment.id] &&
                        `${assessmentStatistics[assessment.id].seen} / ${assessmentStatistics[assessment.id].count}`}
                    </td>
                    <td>{assessment.open ? <Badge variant="success">Offen</Badge> : <Badge variant="danger">Abgeschlossen</Badge>}</td>
                    <td>
                        {assessment.open && <Button variant="primary" onClick={() => {
                            setSessionAssessmentId(assessment.id);
                            history.push(`/assessment/${assessment.id}`);
                        }}>Erfassung</Button>}
                        {assessment.open && <Button variant="danger" onClick={() =>
                            window.confirm("Soll der ausgewählte Vorgang wirklich abgeschlossen werden?")
                            && assessmentAction(assessment.id, "close")
                        }>Schließen</Button>}
                        {assessment.open || <Button variant="danger" onClick={() =>
                            assessmentAction(assessment.id, "reopen")
                        }>Erneut öffnen</Button>}
                        <Button variant="secondary" href={
                            `${api.contextPath}/api/assessments/${assessment.id}/csv`
                        }>Export</Button>
                    </td>
                </tr>)}
                </tbody>
            </Table>
        </Container>
    );
}
