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
import SearchField from "./SearchField";
import SearchResults from "./SearchResults";
import ItemDetails from "./ItemDetails";
import {Container} from "react-bootstrap";

export default function SearchPage() {
    const searchInputRef = React.createRef();

    const [ item, setItem ] = useState();
    const [ results, setResults ] = useState();

    useEffect(() => {
        setTimeout(() => console.log("Focussed", document.querySelector(':focus')), 1000);
        searchInputRef.current.focus();
    }, [ item ]);

    return <Container fluid>
        <SearchField mode="identify" inputRef={searchInputRef} onResults={setResults}/>
        {results && <SearchResults results={results} onSelect={setItem}/>}
        {item && <ItemDetails item={item}/>}
    </Container>;
}
