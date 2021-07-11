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

    addImage(elementId, path, size, position, angle) {
        const imagePosition = position.offset(- size / 2, - size / 2);
        const element = this.createSVGElement("image", {
            id: elementId,
            href: path, 
            x: imagePosition.x,
            y: imagePosition.y,
            height: size,
            width: size,
            transform: `rotate(${angle} ${position.coords()})`
        }, null);
        this.svg.appendChild(element);
    }

    addLabel(elementId, position, value) {
        const element = this.createSVGElement("text", {
            x: position.x,
            y: position.y,
            id: elementId,
            "text-anchor": "middle",
            style: "user-select:none;"
        }, value);
        this.svg.appendChild(element);
    }

    addCircle(elementId, radius, position) {
        const element = this.createSVGElement("circle", {
            id: elementId,
            cx: position.x,
            cy: position.y,
            r: radius
        }, null);
        this.svg.appendChild(element);
    }

    addPolyline(elementId, polyLinePoints, lineStyle) {
        const style = Object.keys(lineStyle).
                map((prop) => `${prop}:${lineStyle[prop]};`).
                join("");

        const element = this.createSVGElement("polyline", {
            id: elementId,
            points: SVGGraphicsView.pointsToPolylineString(polyLinePoints),
            style: style
        }, null);
        this.svg.appendChild(element);
    }

    removeElement(elementId) {
        const element = this.doc.getElementById(elementId);
        if (element) {
            this.svg.removeChild(element);
        }
    }

    updateImage(elementId, size, position, angle) {
        const img = this.doc.getElementById(elementId);
        const halfImgSize = size / 2;
        const adjustedPosition = position.offset(-halfImgSize, -halfImgSize);
        img.setAttribute("x", adjustedPosition.x);
        img.setAttribute("y", adjustedPosition.y);
        img.setAttribute("transform", `rotate(${angle} ${position.coords()})`);
    }

    updateLabel(elementId, position, value) {
        const text = this.doc.getElementById(elementId);
        text.setAttribute("x", position.x);
        text.setAttribute("y", position.y);
        text.textContent = value;
    }

    updateCircle(elementId, position) {
        const circleElement = this.doc.getElementById(elementId);
        circleElement.setAttribute("cx", position.x);
        circleElement.setAttribute("cy", position.y);
    }

    updatePolyline(elementId, polyLinePoints) {
        const lineElement = this.doc.getElementById(elementId);
        const polyStr = SVGGraphicsView.pointsToPolylineString(polyLinePoints);
        lineElement.setAttribute("points", polyStr);
    }

    getPolylinePoints(elementId) {
        const line = this.doc.getElementById(elementId);
        const pointsStr = line.getAttribute("points");
        return SVGGraphicsView.polylineStringToPoints(pointsStr);
    }

    getImagePosition(elementId, imageSize) {
        const image = this.doc.getElementById(elementId);
        return new Position(image.x.baseVal.value, image.y.baseVal.value).offset(imageSize / 2, imageSize / 2);
    }

    getCirclePosition(elementId) {
        const circle = this.doc.getElementById(elementId);
        return new Position(circle.cx.baseVal.value, circle.cy.baseVal.value);
    }

    setElementStyle(elementId, style) {
        const element = this.doc.getElementById(elementId);
        if (element) {
            Object.assign(element.style, style);
        }
    }
}
