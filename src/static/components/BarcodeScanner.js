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
import React, {useState} from "react";
import Quagga from "@ericblade/quagga2";
import {Button, Col, Dropdown, Modal, Row} from "react-bootstrap";
import {useLocalStorage} from "../hooks";

const defaultResolutions = [
    [320, 200],
    [640, 480],
    [800, 600],
    [1024, 768],
    [1280, 1024],
    [1600, 1200],
    [1920, 1080],
];

const patchSizeLabel = {
    'x-small': 'Extra-Klein',
    'small': 'Klein',
    'medium': 'Mittel',
    'large': 'Groß',
    'x-large': 'Extra-Groß',
};

function findResolutions(width, height, aspectRatio) {
    let allowed = [];
    for (let res of defaultResolutions) {
        if (width && width.min && width.max && (res[0] < width.min || res[0] > width.max)) {
            continue;
        }
        if (height && height.min && height.max && (res[1] < height.min || res[1] > height.max)) {
            continue;
        }
        const ar = res[0] / res[1];
        if (aspectRatio && aspectRatio.min && aspectRatio.max && (ar < aspectRatio.min || ar > aspectRatio.max)) {
            continue;
        }
        allowed.push(res);
    }
    if (allowed.length === 0) {
        return defaultResolutions;
    } else if (width && width.max && height && height.max &&
        (allowed[allowed.length-1][0] !== width.max || allowed[allowed.length-1][1] !== height.max)) {
        allowed.push([width.max, height.max]);
    }
    return allowed;
}

const MAX_ZOOM_STEPS = 20;
const MIN_ZOOM_STEP_SIZE = 0.1;

function findZoomSteps(zoom) {
    if (!zoom || !zoom.min || !zoom.max) {
        return null;
    }

    let steps = [];
    const range = zoom.max - zoom.min;
    if (range / MIN_ZOOM_STEP_SIZE <= MAX_ZOOM_STEPS) {
        for (let f = zoom.min; f < zoom.max; f += MIN_ZOOM_STEP_SIZE) {
            steps.push(f);
        }
        steps.push(zoom.max);
    } else {
        const stepSize = range / MAX_ZOOM_STEPS;
        for (let f = zoom.min; f < zoom.max; f += stepSize) {
            steps.push(f);
        }
        steps.push(zoom.max);
    }
    return steps;
}

export default function BarcodeScanner({ onDetected, children }) {
    const targetRef = React.createRef();

    const [ resolution, setResolution ] = useLocalStorage("barcode.resolution", [800, 600]);
    const [ torch, setTorch ] = useLocalStorage("barcode.torch", false);
    const [ zoom, setZoom ] = useLocalStorage("barcode.zoom", 1.0);
    const [ patchSize, setPatchSize ] = useLocalStorage("barcode.patchSize", "medium");
    const [ cameraId, setCameraId ] = useLocalStorage("barcode.cameraId", Quagga.CameraAccess.getActiveStreamLabel());

    const [ capabilities, setCapabilities ] = useState({});
    const [ showCaps, setShowCaps ] = useState(false);
    const [ currentCameraLabel, setCurrentCameraLabel ] = useState("-");

    React.useEffect(() => {
        console.log("Registering Quagga");
        Quagga.init({
            inputStream: {
                target: targetRef.current,
                type : "LiveStream",
                constraints: {
                    deviceId: cameraId,
                    width: resolution[0],
                    height: resolution[1],
                }
            },
            locator: {
                patchSize,
                halfSample: true
            },
            numOfWorkers: 4,
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

            setCurrentCameraLabel(Quagga.CameraAccess.getActiveStreamLabel());
            const track = Quagga.CameraAccess.getActiveTrack();
            if (track && typeof track.getCapabilities === 'function') {
                const caps = track.getCapabilities();
                if (caps.torch) {
                    track.applyConstraints({advanced: [{torch}]});
                }
                if (caps.zoom && caps.zoom.min && caps.zoom.max) {
                    track.applyConstraints({advanced: [{zoom}]});
                }
                setCapabilities(caps);
            } else {
                setCapabilities({});
            }
        });
        Quagga.onDetected(onDetected);

        return () => {
            console.log("Stopping Quagga");
            Quagga.offDetected(onDetected);
            Quagga.stop()
        }
    }, [torch, zoom, cameraId, resolution, patchSize]);

    const [ cameras, setCameras ] = useState();
    Quagga.CameraAccess.enumerateVideoDevices().then(setCameras);
    const resolutions = findResolutions(capabilities.width, capabilities.height, capabilities.aspectRatio);
    const zoomSteps = findZoomSteps(capabilities.zoom);

    return <React.Fragment>
        <Row>
            <Col lg={{span: 4, offset: 3}} sm={12}>
                <div ref={targetRef} className="barcode-scanner"></div>
            </Col>
        </Row>
        <Row>
            <Col sm={12} md={5} lg={3}>
                {cameras && <Dropdown>
                    <Dropdown.Toggle>Kamera: {currentCameraLabel}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {cameras.map(camera => <Dropdown.Item
                            key={camera.deviceId || camera.id}
                            onClick={() => setCameraId(camera.deviceId || camera.id)}
                        >{camera.label}</Dropdown.Item>)}
                    </Dropdown.Menu>
                </Dropdown>}
            </Col>
            {capabilities.torch && <Col sm={12} md={3} lg={2}>
                <Button active={torch} onClick={() => setTorch(!torch)}>Licht</Button>
            </Col>}
            {zoomSteps && <Col sm={12} md={3} lg={2}>
                <Dropdown>
                    <Dropdown.Toggle>Zoom: {zoom}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {zoomSteps.map((f, i) => <Dropdown.Item
                            key={i} onClick={() => setZoom(f)}
                        >{f}</Dropdown.Item>)}
                    </Dropdown.Menu>
                </Dropdown>
            </Col>}
            <Col sm={12} md={3} lg={2}>
                <Dropdown>
                    <Dropdown.Toggle>Auflösung: {resolution[0] + 'x' + resolution[1]}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {resolutions.map((res, i) => <Dropdown.Item
                            key={i} onClick={() => setResolution(res)}
                        >{res[0] + 'x' + res[1]}</Dropdown.Item>)}
                    </Dropdown.Menu>
                </Dropdown>
            </Col>
            <Col sm={12} md={3} lg={2}>
                <Dropdown>
                    <Dropdown.Toggle>Strichcode: {patchSizeLabel[patchSize]}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {Object.entries(patchSizeLabel).map(([size, label]) => <Dropdown.Item
                            key={size} onClick={() => setPatchSize(size)}
                        >{label}</Dropdown.Item>)}
                    </Dropdown.Menu>
                </Dropdown>
            </Col>
            <Col sm={12} md={3} lg={2}>
                <Button onClick={() => setShowCaps(true)}>Kamera-Info</Button>

            </Col>
            <Col sm={12} md={4} lg={3}>
                {children}
            </Col>
        </Row>
        <Modal show={showCaps} onHide={() => setShowCaps(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Kamera-Info</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <h5>Eigenschaften dieser Kamera:</h5>
                <pre>{JSON.stringify(capabilities, 2, 2)}</pre>
                <h5>Verfügbare Kameras:</h5>
                <pre>{JSON.stringify(cameras, 2, 2)}</pre>
            </Modal.Body>
        </Modal>
    </React.Fragment>;
};
