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
import {Container, Modal, Spinner} from "react-bootstrap";

export default class PageSpinner extends React.Component {
    render() {
        return (
            <Container>
                <Modal.Dialog centered>
                    <Modal.Header>
                        <Modal.Title>Bitte warten ...</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <center>
                            <Spinner animation="border"/>
                        </center>
                    </Modal.Body>
                </Modal.Dialog>
            </Container>
        );
    }
}