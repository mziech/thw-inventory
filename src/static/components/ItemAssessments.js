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
