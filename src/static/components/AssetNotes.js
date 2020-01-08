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

export default class AssetNotes extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            notes: { content: [] },
            comment: ""
        };
    }

    componentDidMount() {
        this.load();
    }

    load() {
        this.setState({ loading: true });
        api.get(
            this.props.assessmentId
            ? `/assessments/${this.props.assessmentId}/assets/${this.props.assetId}/notes`
            : `/assets/${this.props.assetId}/notes`
        ).then(({json}) => {
            this.setState({
                loading: false,
                notes: json
            })
        });
    }

    render() {
        return <React.Fragment>
            <h3>Notizen <Icon.Sync button size="sm" onClick={() => this.load()}/></h3>
            {this.loading && <Spinner animated="border"/>}
            <Table>
                <thead>
                <tr>
                    <th>Zeit</th>
                    <th>Inhalt</th>
                </tr>
                </thead>
                <tbody>
                    {this.state.notes.content.map((note, i) => <tr key={i}>
                        <td>
                            <OverlayTrigger overlay={<Tooltip>{note.createdBy}</Tooltip>}>
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
                    <Form.Control as="textarea" required value={this.state.comment} onChange={e => this.setState({comment: e.target.value})} rows={3}/>
                </Form.Group>
                {this.state.submitting && <Spinner animated="border"/>}
                {!this.state.submitting && this.props.assessmentId && <Button onClick={() => this.onSubmitComment(false)}>Nur dieser Vorgang</Button>}
                {!this.state.submitting && <Button onClick={() => this.onSubmitComment(true)}>Permanent</Button>}
            </Form>
        </React.Fragment>;
    }

    onSubmitComment(permanent) {
        this.setState({ submitting: true });
        api.post(permanent
            ? `/assets/${this.props.assetId}/notes`
            : `/assessments/${this.props.assessmentId}/assets/${this.props.assetId}/notes`,
            {
                type: "COMMENT",
                text: this.state.comment
            }
        ).then(() => {
            this.setState({ submitting: false, comment: "" });
            this.load();
        }).catch(err => {
            console.log("Failed to submit note", err);
            this.setState({ submitting: false });
        })
    }

}
