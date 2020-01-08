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
import api from "../api";
import {Button, Modal, OverlayTrigger, Popover, Table} from "react-bootstrap";
import Icon from "../Icon";
import PageSelect from "./PageSelect";
import AssetDetailsModal from "./AssetDetailsModal";

export default class AssessmentMissing extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            selectedItem: null,
            items: [],
            totalElements: 0,
            totalPages: 0
        }
    }

    componentDidMount() {
        this.load();
    }

    load(page) {
        api.get(`/assessments/${this.props.assessmentId}/unseen?page=${page === undefined ? this.state.page : page}&size=10`).then(({json}) => {
            this.setState({
                page: json.number,
                items: json.content,
                totalElements: json.totalElements,
                totalPages: json.totalPages
            });
        });
    }

    render() {
        const history = new Set(this.props.history.map(item => item.asset.inventoryId));
        const items = this.state.items.filter(item => !history.has(item.inventoryId));
        return <div>
            <div>
                {this.state.totalElements - (this.state.items.length - items.length)} noch nicht erfasst.
                <Icon.Sync size="sm" button onClick={() => this.load()}/>
            </div>
            <Table responsive size="sm">
                <thead>
                    <tr>
                        <th>Inventarnr.</th>
                        <th>Ausstattung</th>
                    </tr>
                </thead>
                <tbody>
                {items.map((item, i) => <tr key={i}>
                    <td>{item.inventoryId}</td>
                    <td>
                        <Button variant="link" onClick={() => this.setState({ selectedItem: item })}>
                            {item.description}
                        </Button>
                    </td>
                </tr>)}
                </tbody>
            </Table>
            <PageSelect page={this.state.page} totalPages={this.state.totalPages} onChange={page => {
                this.load(page);
            }}/>
            <AssetDetailsModal item={this.state.selectedItem} onHide={() => this.setState({ selectedItem: null })}/>
        </div>;
    }

}
