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
