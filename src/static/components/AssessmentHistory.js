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
import {Button, Spinner, Table} from "react-bootstrap";
import Icon from "../Icon";
import AssetDetailsModal from "./AssetDetailsModal";

export default class AssessmentHistory extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            selectedItem: null
        };
    }


    render() {
        return <React.Fragment>
            <Table responsive size="sm">
                <thead>
                <tr>
                    <th>Inventarnr.</th>
                    <th>Ausstattung</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {this.props.history.map((entry, i) => <tr key={i}>
                    <td>{entry.asset.inventoryId || `(${entry.asset.id})`}</td>
                    <td>
                        <Button variant="link" onClick={() => this.setState({ selectedItem: entry.asset })}>
                            {entry.asset.description}
                        </Button>
                    </td>
                    <td>
                        {entry.loading && <Spinner animation="border" size="sm"/>}
                        {!entry.loading && !entry.reverted && <Icon.Undo button onClick={() => this.props.onUndo(entry.asset.id)}/>}
                        {!entry.loading && entry.reverted && <Icon.Redo button onClick={() => this.props.onRedo(entry.asset.id)}/>}
                    </td>
                </tr>)}
                </tbody>
            </Table>
            <AssetDetailsModal item={this.state.selectedItem} onHide={() => this.setState({ selectedItem: null })}/>
        </React.Fragment>;
    }

}