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
import {Badge, OverlayTrigger, Tooltip} from "react-bootstrap";
import dayjs from "dayjs";
import React from "react";

export default ({assessment}) => <OverlayTrigger overlay={<Tooltip id={"details"}>
    Erstellt
    {assessment.createdDate && ` am ${dayjs(assessment.createdDate).format('llll')}`}
    {assessment.createdBy && ` von ${assessment.createdBy}`}<br/>
    {assessment.closedDate && `Geschlossen am ${dayjs(assessment.closedDate).format('llll')}`}
</Tooltip>}>
    {assessment.open ? <Badge variant="success">Offen</Badge> : <Badge variant="danger">Abgeschlossen</Badge>}
</OverlayTrigger>;
