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
import {Col, Container, Row} from "react-bootstrap";
import AssetSource from "./AssetSource";
import AssetNotes from "./AssetNotes";

export default class ItemDetails extends React.Component {

    render() {
        if (!this.props.item) {
            return <React.Fragment/>;
        }

        return <Container fluid>
            <Row>
                <Col md={4}>
                    <AssetSource item={this.props.item}/>
                </Col>
                <Col md={8}>
                    <AssetNotes assetId={this.props.item.id}/>
                </Col>
            </Row>
        </Container>;
    }

}