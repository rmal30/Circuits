import Position from "../rendering/position.js";

export default class SVGGraphicsView {

    constructor(doc, svg) {
        this.doc = doc;
        this.svg = svg;
        this.images = new SVGImages(this);
        this.labels = new SVGLabels(this);
        this.circles = new SVGCircles(this);
        this.polylines = new SVGPolylines(this);
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

    removeElement(elementId) {
        const element = this.doc.getElementById(elementId);
        if (element) {
            this.svg.removeChild(element);
        }
    }

    setElementStyle(elementId, style) {
        const element = this.doc.getElementById(elementId);
        if (element) {
            Object.assign(element.style, style);
        }
    }
}

class SVGImages {

    constructor(graphics) { 
        this.graphics = graphics;
    }

    add(elementId, path, size, position, angle) {
        const imagePosition = position.offset(- size / 2, - size / 2);
        const element = this.graphics.createSVGElement("image", {
            id: elementId,
            href: path, 
            x: imagePosition.x,
            y: imagePosition.y,
            height: size,
            width: size,
            transform: `rotate(${angle} ${position.coords()})`
        }, null);
        this.graphics.svg.appendChild(element);
    }

    update(elementId, size, position, angle) {
        const img = this.graphics.doc.getElementById(elementId);
        const halfImgSize = size / 2;
        const adjustedPosition = position.offset(-halfImgSize, -halfImgSize);
        img.setAttribute("x", adjustedPosition.x);
        img.setAttribute("y", adjustedPosition.y);
        img.setAttribute("transform", `rotate(${angle} ${position.coords()})`);
    }

    getPosition(elementId, imageSize) {
        const image = this.graphics.doc.getElementById(elementId);
        return new Position(image.x.baseVal.value, image.y.baseVal.value).offset(imageSize / 2, imageSize / 2);
    }
}

class SVGLabels {
    constructor(graphics) { 
        this.graphics = graphics;
    }

    add(elementId, position, value) {
        const element = this.graphics.createSVGElement("text", {
            x: position.x,
            y: position.y,
            id: elementId,
            "text-anchor": "middle",
            style: "user-select:none;"
        }, value);
        this.graphics.svg.appendChild(element);
    }

    update(elementId, position, value) {
        const text = this.graphics.doc.getElementById(elementId);
        text.setAttribute("x", position.x);
        text.setAttribute("y", position.y);
        text.textContent = value;
    }
}

class SVGCircles {
    constructor(graphics) { 
        this.graphics = graphics;
    }

    add(elementId, radius, position) {
        const element = this.graphics.createSVGElement("circle", {
            id: elementId,
            cx: position.x,
            cy: position.y,
            r: radius
        }, null);
        this.graphics.svg.appendChild(element);
    }

    update(elementId, position) {
        const circleElement = this.graphics.doc.getElementById(elementId);
        circleElement.setAttribute("cx", position.x);
        circleElement.setAttribute("cy", position.y);
    }

    getPosition(elementId) {
        const circle = this.graphics.doc.getElementById(elementId);
        return new Position(circle.cx.baseVal.value, circle.cy.baseVal.value);
    }
}

class SVGPolylines {
    constructor(graphics) { 
        this.graphics = graphics;
    }

    add(elementId, polyLinePoints, lineStyle) {
        const style = Object.keys(lineStyle).
                map((prop) => `${prop}:${lineStyle[prop]};`).
                join("");

        const element = this.graphics.createSVGElement("polyline", {
            id: elementId,
            points: SVGPolylines.stringifyPoints(polyLinePoints),
            style: style
        }, null);
        this.graphics.svg.appendChild(element);
    }

    update(elementId, polyLinePoints) {
        const lineElement = this.graphics.doc.getElementById(elementId);
        const polyStr = SVGPolylines.stringifyPoints(polyLinePoints);
        lineElement.setAttribute("points", polyStr);
    }

    getPoints(elementId) {
        const line = this.graphics.doc.getElementById(elementId);
        const pointsStr = line.getAttribute("points");
        return SVGPolylines.parsePoints(pointsStr);
    }

    static stringifyPoints(polyLinePoints) {
        return polyLinePoints.map((point) => `${point.x},${point.y}`).join(" ");
    }

    static parsePoints(polylineStr){
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
}