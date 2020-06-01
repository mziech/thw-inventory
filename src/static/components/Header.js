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
import React, {useEffect} from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {NavLink, useLocation, useRouteMatch} from "react-router-dom";
import {useSessionStorage} from "../hooks";
import api from "../api";


export default function Header({ username, onLogout }) {
    const [assessmentId, setAssessmentId] = useSessionStorage("assessmentId");

    const routeMatch = useRouteMatch("/assessment/:id");
    useEffect(() => {
        if (routeMatch && routeMatch.params.id) {
            setAssessmentId(routeMatch.params.id);
        }
    }, [ routeMatch ]);

    function logout() {
        api.post("/logout", {}).then(() => onLogout());
    }

    return <Navbar bg={"light"} expand="lg">
        <Navbar.Brand>THW Bestand</Navbar.Brand>
        <Navbar.Toggle/>

        <Navbar.Collapse>
            <Nav className="mr-auto">
                <Nav.Item><NavLink className="nav-link" activeClassName="active" to="/"
                                   exact={true}>Suche</NavLink></Nav.Item>
                <Nav.Item>
                    {assessmentId === undefined &&
                    <NavLink className="nav-link" activeClassName="active" to="/assessment">Erfassung</NavLink>}
                    {assessmentId !== undefined &&
                    <NavLink className="nav-link" activeClassName="active" to={`/assessment/${assessmentId}`}>Erfassung</NavLink>}
                </Nav.Item>
                <Nav.Item><NavLink className="nav-link" activeClassName="active"
                                   to="/assessment" exact>Vorgänge</NavLink></Nav.Item>
                <Nav.Item><NavLink className="nav-link" activeClassName="active"
                                   to="/import">Import</NavLink></Nav.Item>
            </Nav>
            <Nav>
                <Nav.Item><NavLink className="nav-link" activeClassName="active"
                                   to="/current-user">{username}</NavLink></Nav.Item>
                <Nav.Item><Nav.Link onClick={logout}>Abmelden</Nav.Link></Nav.Item>
            </Nav>
        </Navbar.Collapse>
    </Navbar>;
}
