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
import Quagga from "quagga";

export default function BarcodeScanner({ onDetected }) {
    const targetRef = React.createRef();

    React.useEffect(() => {
        console.log("Registering Quagga");
        Quagga.init({
            inputStream: {
                target: targetRef.current,
                type : "LiveStream",
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: "environment" // or user
                }
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 2,
            decoder: {
                readers : [ "code_128_reader"],
                debug: {
                    drawBoundingBox: true,
                    drawScanline: true
                },
                multi: true
            },
            locate: true
        }, function(err) {
            if (err) {
                return console.log("Failed to start barcode reader", err);
            }
            console.log("Starting Quagga");
            Quagga.start();
        });
        Quagga.onDetected(onDetected);

        return () => {
            console.log("Stopping Quagga");
            Quagga.offDetected(onDetected);
            Quagga.stop()
        }
    }, []);
    return <div ref={targetRef} className="barcode-scanner"></div>;
};
