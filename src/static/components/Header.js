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
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {NavLink} from "react-router-dom";
import {useSessionStorage} from "../hooks";
import api from "../api";

function AssessmentItem() {
    const [assessmentId, setAssessmentId] = useSessionStorage("assessmentId");

    return <Nav.Item>
        {assessmentId === undefined && <NavLink className="nav-link" activeClassName="active" to="/assessment">Erfassung</NavLink>}
        {assessmentId !== undefined && <NavLink className="nav-link" activeClassName="active" to={`/assessment/${assessmentId}`}>Erfassung</NavLink>}
    </Nav.Item>;
}

export default class Header extends React.Component {
    render() {
        return <Navbar bg={"light"} expand="lg">
            <Navbar.Brand>THW Bestand</Navbar.Brand>
            <Navbar.Toggle/>

            <Navbar.Collapse>
                <Nav className="mr-auto">
                    <Nav.Item><NavLink className="nav-link" activeClassName="active" to="/" exact={true}>Suche</NavLink></Nav.Item>
                    <AssessmentItem/>
                    <Nav.Item><NavLink className="nav-link" activeClassName="active" to="/import">Import</NavLink></Nav.Item>
                </Nav>
                <Nav>
                    <Nav.Item><NavLink className="nav-link" activeClassName="active" to="/current-user">{this.props.username}</NavLink></Nav.Item>
                    <Nav.Item><Nav.Link onClick={() => this.logout()}>Abmelden</Nav.Link></Nav.Item>
                </Nav>
            </Navbar.Collapse>
        </Navbar>;
    }

    logout() {
        api.post("/logout", {}).then(() => this.props.onLogout());
    }
}
