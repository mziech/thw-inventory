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
import {Button} from "react-bootstrap";
import UndoSolid from "./icons/undo-solid.svg";
import RedoSolid from "./icons/redo-solid.svg";
import SearchSolid from "./icons/search-solid.svg";
import BarcodeSolid from "./icons/barcode-solid.svg";
import SyncSolid from "./icons/sync-solid.svg";
import TasksSolid from "./icons/tasks-solid.svg";

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
                <span className="icon">{this.props.component}</span>
            </Button>;
        }

        return <span className="icon">{this.props.component}</span>;
    }

    static Undo(props) {
        return <Icon component={<UndoSolid/>} {...props} />
    }

    static Redo(props) {
        return <Icon component={<RedoSolid/>} {...props} />
    }

    static Search(props) {
        return <Icon component={<SearchSolid/>} {...props} />
    }

    static Tasks(props) {
        return <Icon component={<TasksSolid/>} {...props} />
    }

    static Sync(props) {
        return <Icon component={<SyncSolid/>} {...props} />
    }

    static Barcode(props) {
        return <Icon component={<BarcodeSolid/>} {...props} />
    }

}
