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
import InlineSVG from "svg-inline-react";
import React from "react";
import {Button} from "react-bootstrap";

export default class Icon extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.button) {
            const all = Object.assign({}, this.props);
            delete all["button"];
            delete all["src"];
            return <Button variant="link" {...all}>
                <InlineSVG className="icon" src={this.props.src}/>
            </Button>;
        }

        return <InlineSVG className="icon" src={this.props.src}/>;
    }

    static Undo(props) {
        return <Icon src={require("svg-inline-loader!./icons/undo-solid.svg")} {...props} />
    }

    static Redo(props) {
        return <Icon src={require("svg-inline-loader!./icons/redo-solid.svg")} {...props} />
    }

    static Search(props) {
        return <Icon src={require("svg-inline-loader!./icons/search-solid.svg")} {...props} />
    }

    static Tasks(props) {
        return <Icon src={require("svg-inline-loader!./icons/tasks-solid.svg")} {...props} />
    }

    static Sync(props) {
        return <Icon src={require("svg-inline-loader!./icons/sync-solid.svg")} {...props} />
    }

    static Barcode(props) {
        return <Icon src={require("svg-inline-loader!./icons/barcode-solid.svg")} {...props} />
    }

}
