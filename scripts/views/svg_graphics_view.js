import {ELEMENT_TYPES, getElementId} from "../schematic/elements.js";
import {DOT_SIZE, IMAGE_SIZE} from "../schematic/layout.js";
import {DEFAULT_LINE_STYLE, STYLES} from "../schematic/style.js";
import Position from "../rendering/position.js";

export default class SVGGraphicsView {

    constructor(doc, svg) {
        this.doc = doc;
        this.svg = svg;
    }

    static pointsToPolylineString(polyLinePoints) {
        return polyLinePoints.map((point) => `${point.x},${point.y}`).join(" ");
    }

    static polylineStringToPoints(polylineStr){
        const points = polylineStr.split(" ").map((pointStr) => {
            const [x, y] = pointStr.split(",").map((v) => Number(v));
            return new Position(x, y)
        });
        const linePoints = [];
        for (let i = 0; i < points.length - 1; i++) {
            linePoints.push([points[i], points[i + 1]]);
        }
        return linePoints;
    }

    createSVGElement(tag, properties, value) {
        const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
        const element = this.doc.createElementNS(SVG_NAMESPACE, tag);

        for (const prop of Object.keys(properties)) {
            element.setAttribute(prop, properties[prop]);
        }

        if (value) {
            element.textContent = value;
        }

        return element;
    }

    addImage(id, position, type, angle) {
        const imagePosition = position.offset(-IMAGE_SIZE / 2, -IMAGE_SIZE / 2);
        const element = this.createSVGElement("image", {
            id: getElementId(id, ELEMENT_TYPES.IMAGE),
            href: `images/${type}.png`,
            x: imagePosition.x,
            y: imagePosition.y,
            height: IMAGE_SIZE,
            width: IMAGE_SIZE,
            transform: `rotate(${angle} ${position.coords()})`
        }, null);
        this.svg.appendChild(element);
    }

    addLabel(id, position, value) {
        const element = this.createSVGElement("text", {
            x: position.x,
            y: position.y,
            id: getElementId(id, ELEMENT_TYPES.LABEL),
            "text-anchor": "middle",
            style: "user-select:none;"
        }, value);
        this.svg.appendChild(element);
    }

    addPin(id, position) {
        const element = this.createSVGElement("circle", {
            id: getElementId(id, ELEMENT_TYPES.PIN),
            cx: position.x,
            cy: position.y,
            r: DOT_SIZE
        }, null);
        this.svg.appendChild(element);
    }

    addPolyline(id, polyLinePoints) {
        const style = Object.keys(DEFAULT_LINE_STYLE).
                map((prop) => `${prop}:${DEFAULT_LINE_STYLE[prop]};`).
                join("");

        const element = this.createSVGElement("polyline", {
            id: getElementId(id, ELEMENT_TYPES.LINE),
            points: SVGGraphicsView.pointsToPolylineString(polyLinePoints),
            style: style
        }, null);
        this.svg.appendChild(element);
    }

    removeElement(id, type) {
        const elementId = getElementId(id, type);
        const element = this.doc.getElementById(elementId);
        if (element) {
            this.svg.removeChild(element);
        }
    }

    removeLine(lineId) {
        this.removeElement(lineId, ELEMENT_TYPES.LINE);
    }

    removePin(pinId) {
        this.removeElement(pinId, ELEMENT_TYPES.PIN);
    }

    removeImage(id) {
        this.removeElement(id, ELEMENT_TYPES.IMAGE);
    }

    removeLabel(id) {
        this.removeElement(id, ELEMENT_TYPES.LABEL);
    }

    updateImage(id, position, angle) {
        const imageElementId = getElementId(id, ELEMENT_TYPES.IMAGE);
        const img = this.doc.getElementById(imageElementId);
        const halfImgSize = IMAGE_SIZE / 2;
        const adjustedPosition = position.offset(-halfImgSize, -halfImgSize);
        img.setAttribute("x", adjustedPosition.x);
        img.setAttribute("y", adjustedPosition.y);
        img.setAttribute("transform", `rotate(${angle} ${position.coords()})`);
    }

    updateLabel(id, position, value) {
        const labelElementId = getElementId(id, ELEMENT_TYPES.LABEL);
        const text = this.doc.getElementById(labelElementId);
        text.setAttribute("x", position.x);
        text.setAttribute("y", position.y);
        text.textContent = value;
    }

    updatePin(pinId, position) {
        const elementId = getElementId(pinId, ELEMENT_TYPES.PIN);
        const pinElement = this.doc.getElementById(elementId);
        pinElement.setAttribute("cx", position.x);
        pinElement.setAttribute("cy", position.y);
    }

    updatePolyline(lineId, polyLinePoints) {
        const elementId = getElementId(lineId, ELEMENT_TYPES.LINE);
        const lineElement = this.doc.getElementById(elementId);
        const polyStr = SVGGraphicsView.pointsToPolylineString(polyLinePoints);
        lineElement.setAttribute("points", polyStr);
    }

    getPolylinePoints(lineId) {
        const elementId = getElementId(lineId, ELEMENT_TYPES.LINE);
        const line = this.doc.getElementById(elementId);
        const pointsStr = line.getAttribute("points");
        return SVGGraphicsView.polylineStringToPoints(pointsStr);
    }

    getImagePosition(componentId) {
        const elementId = getElementId(componentId, ELEMENT_TYPES.IMAGE);
        const image = this.doc.getElementById(elementId);
        return new Position(image.x.baseVal.value, image.y.baseVal.value).offset(IMAGE_SIZE / 2, IMAGE_SIZE / 2);
    }

    getPinPosition(pinId) {
        const elementId = getElementId(pinId, ELEMENT_TYPES.PIN);
        const pin = this.doc.getElementById(elementId);
        return new Position(pin.cx.baseVal.value, pin.cy.baseVal.value);
    }

    setElementSelected(selected, id, type) {
        const elementId = getElementId(id, type);
        const element = this.doc.getElementById(elementId);

        if (element) {
            const style = selected ? STYLES.select[type] : STYLES.deselect[type];
            Object.assign(element.style, style);
        }
    }

    setSelectedItem(item) {
        if (item.selected) {
            this.setElementSelected(true, item.id, item.type);
        }
    }

    clearSelectedItem(item) {
        if (item.selected) {
            this.setElementSelected(false, item.id, item.type);
        }
    }
}
