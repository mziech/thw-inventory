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
import AssessmentSelect from "./AssessmentSelect";
import {Container} from "react-bootstrap";
import {Redirect} from "react-router";
import {useSessionStorage} from "../hooks";

function AssessmentSelected({assessmentId}) {
    const [ oldAssessmentId, setAssessmentId ] = useSessionStorage("assessmentId");
    setAssessmentId(assessmentId);
    return <Redirect to={`/assessment/${assessmentId}`}/>
}

export default class AssessmentSelectionPage extends React.Component {

    render() {
        if (this.state && this.state.assessmentId) {
            return <AssessmentSelected assessmentId={this.state.assessmentId}/>
        }

        return (
            <Container>
                <h1>Bitte wählen Sie einen Vorgang aus:</h1>
                <AssessmentSelect onlyOpen={true} onSelect={assessmentId => this.onSelect(assessmentId)}/>
            </Container>
        );
    }

    onSelect(assessmentId) {
        this.setState({ assessmentId });
    }


}