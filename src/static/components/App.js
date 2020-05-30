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
import Header from "./Header";
import { BrowserRouter, Route, Link } from "react-router-dom";
import SearchPage from "./SearchPage";
import ImportPage from "./ImportPage";
import AssessmentPage from "./AssessmentPage";
import AssessmentListPage from "./AssessmentListPage";
import api from "../api";
import PageSpinner from "./PageSpinner";
import CurrentUserPage from "./CurrentUserPage";

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedOut: false,
            loading: true
        };
    }


    componentDidMount() {
        api.get("/current-user").then(({json}) => {
            api.headers = {
                [json.csrfHeader]: json.csrfToken
            };
            this.setState({
                loading: false,
                username: json.username
            })
        })
    }

    render() {
        if (this.state.loading) {
            return <PageSpinner/>;
        }

        if (this.state.loggedOut) {
            return <div>Sie sind abgemeldet.</div>;
        }

        return <BrowserRouter basename={api.contextPath}>
            <Header username={this.state.username} onLogout={() => this.setState({ loggedOut: true })}/>
            <Route path="/" exact component={SearchPage}/>
            <Route path="/assessment" exact component={AssessmentListPage}/>
            <Route path="/assessment/:id" exact component={p => <AssessmentPage assessmentId={p.match.params.id}/>}/>
            <Route path="/import" exact component={ImportPage}/>
            <Route path="/current-user" exact component={CurrentUserPage}/>
        </BrowserRouter>;
    }
}
