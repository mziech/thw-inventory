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
import {Button, Container, Form} from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import api from "../api";

export default class CurrentUserPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            noMatch: false
        };
    }


    render() {
        const onChange = this.onChange.bind(this);

        return <Container>
            <h1>Aktueller Benutzer</h1>
            <h2>Passwort ändern</h2>
            <Form onSubmit={e => this.onSubmit(e)}>
                {this.state.success && <Alert variant="success">Passwort erfolgreich geändert!</Alert>}
                {this.state.error && <Alert variant="danger">Beim Ändern des Passworts ist ein Fehler aufgetreten, ist das alte Passwort falsch?</Alert>}
                <Form.Group controlId="old-password">
                    <Form.Label>Altes Passwort</Form.Label>
                    <Form.Control name="oldPassword" onChange={onChange} required type="password" />
                </Form.Group>
                <Form.Group controlId="new-password">
                    <Form.Label>Neues Passwort</Form.Label>
                    <Form.Control name="newPassword" onChange={onChange} required type="password" />
                </Form.Group>
                <Form.Group controlId="new-password2">
                    <Form.Label>Neues Passwort (wiederholen)</Form.Label>
                    <Form.Control name="newPassword2" onChange={onChange} required type="password" />
                </Form.Group>
                {this.state.newPassword !== this.state.newPassword2 && <Alert variant="danger">Neue Passwörter stimmen nicht überein!</Alert>}
                <Button variant="primary" type="submit">Passwort ändern</Button>
            </Form>
        </Container>;
    }

    onChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    onSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;
        if (form.checkValidity() === false || this.state.newPassword !== this.state.newPassword2) {
            return;
        }

        api.post("/current-user/password", {
            oldPassword: this.state.oldPassword,
            newPassword: this.state.newPassword
        }).then(() => {
            this.setState({
                success: true,
                error: false,
                oldPassword: "",
                newPassword: "",
                newPassword2: ""
            });
        }).catch(err => {
            console.log("Password change error", err);
            this.setState({ error: true, success: false });
        })
    }
}
