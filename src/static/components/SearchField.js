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
import "./SearchField.scss";
import React from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import Dropdown from "react-bootstrap/Dropdown";
import {Col, Form, FormControl, Row, Spinner, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import api from "../api";
import Icon from "../Icon";
import BarcodeScanner from "./BarcodeScanner";
import audio from "../audio";

const types = [
   {type: 'ANY_ID', label: 'Geräte- o. Inventarnr.'},
   {type: 'INVENTORY_ID', label: 'Inventarnr.'},
   {type: 'DEVICE_ID', label: 'Gerätenr.'},
   {type: 'DESCRIPTION', label: 'Ausstattung'},
   {type: 'MANUFACTURER', label: 'Hersteller'},
   {type: 'PART_ID', label: 'Sachnummer'},
   {type: 'UNIT', label: 'AN/Einheit'},
];

export default class SearchField extends React.Component {

   constructor(props) {
      super(props);
      this.state = {
         type: types[0].type,
         typeLabel: types[0].label,
         value: '',
         locked: false,
         scanner: false,
         scanMulti: false,
         lastDetected: null
      };
   }

   render() {
      return <Jumbotron>
         <Form onSubmit={this.onSubmit.bind(this)}>
            <Row>
               <Col sm={12} md="auto">
                  <Dropdown>
                     <Dropdown.Toggle variant="secondary" disabled={this.state.locked} className="btn-block" size="lg">
                        {this.state.typeLabel}
                     </Dropdown.Toggle>

                     <Dropdown.Menu>
                        {types.map((type, index) => <React.Fragment key={`type-item-${index}`}>
                           <Dropdown.Item onClick={() => this.setTypeIndex(index)}>{type.label}</Dropdown.Item>
                           {index === 0 && <Dropdown.Divider />}
                        </React.Fragment>)}
                     </Dropdown.Menu>
                  </Dropdown>
               </Col>
               <Col sm={12} md={true}>
                  <FormControl type="text" className="form-control" value={this.state.value}
                               onChange={e => this.setValue(e.target.value)}
                               ref={this.props.inputRef}
                               size="lg"
                               disabled={this.state.locked} />
               </Col>
               <Col xs={3} sm={4} md="auto">
                  <Icon.Barcode button variant="secondary"
                                active={this.state.scanner}
                                disabled={this.state.locked}
                                size="lg"
                                block
                                onClick={() => this.setState({ scanner: !this.state.scanner })}>
                     Scan
                  </Icon.Barcode>
               </Col>
               <Col xs={9} sm={8} md="auto">
                  <Button variant="primary" type="submit" size="lg" disabled={this.state.locked} block>
                     {this.props.mode === 'identify' && <span><Icon.Search/> Suchen</span>}
                     {this.props.mode === 'assess' && <span><Icon.Tasks/> Erfassen</span>}
                     {this.state.locked && <Spinner animation="border" />}
                  </Button>
               </Col>
            </Row>
         </Form>
         {this.state.scanner && <Row>
            <Col lg={{span: 4, offset: 3}} sm={12}><BarcodeScanner onDetected={this.onDetected.bind(this)}/></Col>
            <Col lg={2} sm={12}>
               <ToggleButtonGroup
                   type="radio"
                   name="scanMulti"
                   value={this.state.scanMulti}
                   onChange={scanMulti => this.setState({ scanMulti })}
               >
                  <ToggleButton value={false}>Einzeln</ToggleButton>
                  <ToggleButton value={true}>Mehrere</ToggleButton>
               </ToggleButtonGroup>
            </Col>
         </Row>}
      </Jumbotron>
   }

   onDetected({ codeResult }) {
      if (codeResult.code === this.state.lastDetected) {
         console.log("Ignoring duplicate code: ", codeResult);
         return;
      }

      console.log("Detected barcode: ", codeResult);
      audio.detected();
      this.setState({
         value: codeResult.code,
         lastDetected: this.state.scanMulti ? codeResult.code : null,
         scanner: this.state.scanMulti
      }, () => this.search());
   }

   setTypeIndex(index) {
      this.setState({
         type: types[index].type,
         typeLabel: types[index].label
      });
   }

   setValue(value) {
      this.setState({
         value
      });
   }

   setLocked(locked) {
      this.setState({
         locked
      });
   }

   onSubmit(event) {
      event.stopPropagation();
      event.preventDefault();
      this.search();
   }

   search() {
      this.setLocked(true);
      this.props.onResults(null);
      const search = {
         type: this.state.type,
         typeLabel: this.state.typeLabel,
         value: this.state.value
      };
      api.post("/assets/search", search)
          .then(({json}) => {
             this.props.onResults({search, body: json});
             this.setValue('');
             this.setLocked(false);
          }).catch(() => {
             this.setLocked(false);
          });
   }

}
