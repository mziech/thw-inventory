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
import {Pagination} from "react-bootstrap";

const CONTEXT = 2;

export default function ({page, totalPages, onChange}) {
    if (totalPages <= 1) {
        return <React.Fragment/>;
    }

    let items = [];
    if (page > 0) {
        items.push(<Pagination.First key="first" onClick={() => onChange(0)}/>);
        items.push(<Pagination.Prev key="prev" onClick={() => onChange(page - 1)}/>);
    }
    if (page - CONTEXT > 0) {
        items.push(<Pagination.Ellipsis key="ellipsis-start"/>);
    }
    for (let i = Math.max(0, page - CONTEXT); i <= Math.min(totalPages - 1, page + CONTEXT); i++) {
        items.push(<Pagination.Item key={i} onClick={() => onChange(i)} active={i === page}>{i + 1}</Pagination.Item>);
    }
    if (page + CONTEXT < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end"/>);
    }
    if (page < totalPages - 1) {
        items.push(<Pagination.Next key="next" onClick={() => onChange(page + 1)}/>);
        items.push(<Pagination.Last key="last" onClick={() => onChange(totalPages - 1)}/>);
    }

    return <Pagination>{items}</Pagination>;
}
