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
import {Table} from "react-bootstrap";
import React from "react";

export default ({ item }) => {
    if (!item || !item.source) {
        return <React.Fragment/>;
    }

    const source = JSON.parse(item.source);

    return <Table>
        <tbody>
        {Object.keys(source).sort((a, b) => a.localeCompare(b)).map((k) => <tr key={k}>
            <th>{k}</th>
            <td>{source[k]}</td>
        </tr>)}
        </tbody>
    </Table>;
};
