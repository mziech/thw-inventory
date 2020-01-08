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
import {Container, Spinner, Tab, Tabs} from "react-bootstrap";
import Dropzone from "react-dropzone";
import AssessmentSelect from "./AssessmentSelect";
import api from "../api";

export default class ImportPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            assessmentId: null,
            uploading: false
        };
    }

    render() {
        return <Container>
            <h1>Daten importieren</h1>
            <Tabs defaultActiveKey="assessment" id="uncontrolled-tab-example">
                <Tab eventKey="assessment" title="Mit Vorgang">
                    <AssessmentSelect onSelect={assessmentId => this.setAssessmentId(assessmentId)}/>
                    {this.state.assessmentId && this.dropzone(this.state.assessmentId)}
                </Tab>
                <Tab eventKey="asset" title="Ohne Vorgang">
                    {this.dropzone(null)}
                </Tab>
            </Tabs>
        </Container>;
    }

    dropzone(assessmentId) {
        if (this.state.uploading) {
            return <Spinner animation="border" />;
        }

        return <Dropzone onDropAccepted={files => this.uploadFiles(files, assessmentId)}>
            {({getRootProps, getInputProps}) => (
                <div className="file-drop">
                    <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p>Hier klicken oder Datei per Drag'n'Drop fallen lassen</p>
                    </div>
                </div>
            )}
        </Dropzone>;
    }

    uploadFiles(files, assessmentId) {
        this.setState(Object.assign({}, this.state, { uploading: true }));
        Promise.all(files.map(file =>
            api.postFile(assessmentId ? `/assessments/${assessmentId}/assets/import` : '/assets/import', file)
        )).then(() => {
            this.setState(Object.assign({ uploading: false }));
        }).catch(err => {
            console.log("Upload failed", err);
            this.setState(Object.assign({ uploading: false }));
        });

    }

    setAssessmentId(assessmentId) {
        this.setState(Object.assign({}, this.state, { assessmentId }));
    }
}