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
import {Table} from "react-bootstrap";

export default class MultipleResultSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: null
        };
    }


    render() {
        return <React.Fragment>
            <Table responsive size="sm">
                <thead>
                <tr>
                    <th>Inventarnr.</th>
                    <th>AN/Einheit</th>
                    <th>Ausstattung</th>
                    <th>Gerätenr.</th>
                </tr>
                </thead>
                <tbody>
                {this.props.results.body.content.map((item, index) =>
                    <tr key={index} className={this.state.selectedIndex === index ? 'active' : ''} onClick={() => this.select(index)}>
                        <td>{item.inventoryId}</td>
                        <td>{item.unit}</td>
                        <td>{item.description}</td>
                        <td>{item.deviceId}</td>
                    </tr>
                )}
                </tbody>
            </Table>
        </React.Fragment>;
    }

    select(index) {
        this.setState(Object.assign({}, this.state, { selectedIndex: index }));
        this.props.onSelect(this.props.results.body.content[index]);
    }

}
