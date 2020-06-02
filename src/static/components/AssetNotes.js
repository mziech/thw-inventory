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
import {Button, Form, OverlayTrigger, Spinner, Table, Tooltip} from "react-bootstrap";
import api from "../api";
import dayjs from "dayjs";
import Icon from "../Icon";

function NoteText({note}) {
    switch (note.type) {
        case "SEEN":
            return <i>Ausstattung wurde erfasst</i>;
        case "UNSEEN":
            return <i>Die Erfassung der Ausstattung wurde zurückgenommen</i>;
        case "IMPORTED":
            return <i>Die Ausstattung wurde importiert</i>;
        case "COMMENT":
            return <pre>{note.text}</pre>;
    }
    return <i>!! {note.type}: {note.text} !!</i>
}

export default function AssetNotes({ assessmentId, assetId }) {
    const [ loading, setLoading ] = useState(true);
    const [ submitting, setSubmitting ] = useState(false);
    const [ notes, setNotes ] = useState({ content: [] });
    const [ comment, setComment ] = useState("");

    function load() {
        setLoading(true);
        api.get(
            assessmentId
                ? `/assessments/${assessmentId}/assets/${assetId}/notes`
                : `/assets/${assetId}/notes`
        ).then(({json}) => {
            setLoading(false);
            setNotes(json);
        }).catch(err => {
            setLoading(false);
            console.error(`Failed to load notes for ${assetId} in assessment ${assessmentId}`)
        });
    }

    function onSubmitComment(permanent) {
        setSubmitting(true);
        api.post(permanent
            ? `/assets/${assetId}/notes`
            : `/assessments/${assessmentId}/assets/${assetId}/notes`,
            { type: "COMMENT", text: comment }
        ).then(() => {
            setSubmitting(false);
            setComment("");
            load();
        }).catch(err => {
            console.log("Failed to submit note", err);
            setSubmitting(false);
        })
    }

    useEffect(() => {
        load();
    }, [ assessmentId, assetId ])

    return <React.Fragment>
        <h3>Notizen <Icon.Sync button size="sm" onClick={() => load()}/></h3>
        {loading && <Spinner animation={"border"}/>}
        <Table>
            <thead>
            <tr>
                <th>Zeit</th>
                <th>Inhalt</th>
            </tr>
            </thead>
            <tbody>
                {notes.content.map((note, i) => <tr key={i}>
                    <td>
                        <OverlayTrigger overlay={<Tooltip id={"note-date-tooltip"}>{note.createdBy}</Tooltip>}>
                            <span>{dayjs(note.createdDate).format("llll")}</span>
                        </OverlayTrigger>
                    </td>
                    <td><NoteText note={note}/></td>
                </tr>)}
            </tbody>
        </Table>
        <Form>
            <Form.Group controlId="comment">
                <Form.Label>Kommentar:</Form.Label>
                <Form.Control as="textarea" required value={comment} onChange={e => setComment(e.target.value)} rows={3}/>
            </Form.Group>
            {submitting && <Spinner animation={"border"}/>}
            {!submitting && assessmentId && <Button onClick={() => onSubmitComment(false)}>Nur dieser Vorgang</Button>}
            {!submitting && <Button onClick={() => onSubmitComment(true)}>Permanent</Button>}
        </Form>
    </React.Fragment>;
}
