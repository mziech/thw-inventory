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
import {Badge, Container, ProgressBar, Tab, Table, Tabs} from "react-bootstrap";
import Dropzone from "react-dropzone";
import AssessmentSelect from "./AssessmentSelect";
import api from "../api";

function ImportUpload({ file, assessmentId }) {
    const [ status, setStatus ] = useState('open');
    const [ result, setResult ] = useState();

    useEffect(() => {
        setStatus('processing');
        api.postFile(assessmentId ? `/assessments/${assessmentId}/assets/import` : '/assets/import', file).then(() => {
            setStatus('success');
        }).catch(e => {
            console.log(`Failed to upload ${file}`, e.json || e)
            setStatus('failed');
            setResult(e.json && e.json.message);
        });
    }, [ file ]);


    return <tr>
        <td>{file.name}</td>
        <td>
            {status === 'open' && <Badge variant={"secondary"}>Offen</Badge>}
            {status === 'processing' && <ProgressBar variant={"primary"} max={100} now={100} animated={true}/>}
            {status === 'success' && <><Badge variant={"success"}>OK</Badge>  {result}</>}
            {status === 'failed' && <><Badge variant={"danger"}>Fehler</Badge> {result}</>}
        </td>
    </tr>;
}

function ImportDropzone({ assessmentId }) {
    const [ files, setFiles ] = useState([]);

    const onDropAccepted = (moreFiles) => {
        setFiles([ ...files, ...moreFiles ]);
    };

    const uploading = false;

    return <>
        <Table>
            <tbody>
            {files.map((file, i) => <ImportUpload key={i} file={file} assessmentId={assessmentId} />)}
            </tbody>
        </Table>
        {!uploading && <Dropzone onDropAccepted={onDropAccepted}>
            {({getRootProps, getInputProps}) => (
                <div className="file-drop">
                    <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p>Hier klicken oder Datei per Drag'n'Drop fallen lassen</p>
                    </div>
                </div>
            )}
        </Dropzone>}
    </>;
}

export default function ImportPage() {

    const [ assessmentId, setAssessmentId ] = useState(null);

    return <Container>
        <h1>Daten importieren</h1>
        <Tabs defaultActiveKey="assessment" id="uncontrolled-tab-example">
            <Tab eventKey="assessment" title="Mit Vorgang">
                <AssessmentSelect onSelect={setAssessmentId}/>
                {assessmentId && <ImportDropzone assessmentId={assessmentId}/>}
            </Tab>
            <Tab eventKey="asset" title="Ohne Vorgang">
                <ImportDropzone assessmentId={null}/>
            </Tab>
        </Tabs>
    </Container>;

}