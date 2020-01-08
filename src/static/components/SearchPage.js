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
import SearchField from "./SearchField";
import SearchResults from "./SearchResults";
import ItemDetails from "./ItemDetails";
import {Container} from "react-bootstrap";

export default class SearchPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.searchInputRef = React.createRef();
    }

    render() {
        return <Container fluid>
            <SearchField mode="identify" inputRef={this.searchInputRef} onResults={results => this.setResults(results)}/>
            {this.state.results && <SearchResults results={this.state.results} onSelect={item => this.onSelect(item)}/>}
            {this.state.item && <ItemDetails item={this.state.item}/>}
        </Container>;
    }

    setResults(results) {
        this.setState(Object.assign({}, this.state, {
            results
        }));
    }

    onSelect(item) {
        this.searchInputRef.current.focus();
        this.setState(Object.assign({}, this.state, {
            item
        }));
    }
}
