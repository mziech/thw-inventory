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
import api from "../api";
import {Spinner, Table} from "react-bootstrap";
import AssessmentStatus from "./AssessmentStatus";
import PageSelect from "./PageSelect";
import {Link} from "react-router-dom";

export default ({assetId}) => {
    const [results, setResults] = useState(null);
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (!assetId) {
            setResults([]);
            return;
        }

        setResults(null);
        api.get(`/assets/${assetId}/assessments?pageNumber=${page}&pageSize=10`).then(({ json }) => setResults(json));
    }, [assetId, page])

    if (results === null) {
        return <Spinner animation={"border"}/>;
    }

    return <React.Fragment>
        <Table>
            <thead>
            <th>Name</th>
            <th>Status</th>
            <th>Erfasst</th>
            </thead>
            <tbody>
            {results.content.map(result => <tr>
                <td><Link to={`/assessment/${result.assessment.id}`}>{result.assessment.name}</Link></td>
                <td><AssessmentStatus assessment={result.assessment}/></td>
                <td>{result.seen ? 'Ja' : 'Nein'}</td>
            </tr>)}
            </tbody>
        </Table>
        <PageSelect page={page} totalPages={results.totalPages} onChange={page => setPage(page)}/>
    </React.Fragment>;
};
