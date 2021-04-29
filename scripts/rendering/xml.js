class CircuitXML {

    static newElement(tag, properties, value) {
        const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
        const element = document.createElementNS(SVG_NAMESPACE, tag);

        for (const prop of Object.keys(properties)) {
            element.setAttribute(prop, properties[prop]);
        }

        if (value) {
            element.textContent = value;
        }

        return element;
    }

    static newImage(id, position, type, angle) {
        const imagePosition = position.offset(-IMAGE_SIZE / 2, -IMAGE_SIZE / 2);
        return CircuitXML.newElement("image", {
            id: getElementId(id, ELEMENT_TYPES.IMAGE),
            href: `images/${type}.png`,
            x: imagePosition.x,
            y: imagePosition.y,
            height: IMAGE_SIZE,
            width: IMAGE_SIZE,
            transform: `rotate(${angle} ${position.coords()})`
        }, null);
    }

    static newLabel(id, position, value) {
        return CircuitXML.newElement("text", {
            x: position.x,
            y: position.y,
            id: getElementId(id, ELEMENT_TYPES.LABEL),
            "text-anchor": "middle",
            style: "user-select:none;"
        }, value);
    }

    static newPin(id, position) {
        return CircuitXML.newElement("circle", {
            id: getElementId(id, ELEMENT_TYPES.PIN),
            cx: position.x,
            cy: position.y,
            r: DOT_SIZE
        }, null);
    }

    static newLine(id, points) {
        const style = Object.keys(DEFAULT_LINE_STYLE).
                map((prop) => `${prop}:${DEFAULT_LINE_STYLE[prop]};`).
                join("");

        return CircuitXML.newElement("polyline", {
            id: getElementId(id, ELEMENT_TYPES.LINE),
            points: points,
            style: style
        }, null);
    }

    static updateImage(img, position, angle) {
        const halfImgSize = IMAGE_SIZE / 2;
        const adjustedPosition = position.offset(-halfImgSize, -halfImgSize);
        img.setAttribute("x", adjustedPosition.x);
        img.setAttribute("y", adjustedPosition.y);
        img.setAttribute("transform", `rotate(${angle} ${position.coords()})`);
    }

    static updateLabel(text, position, value) {
        text.setAttribute("x", position.x);
        text.setAttribute("y", position.y);
        text.textContent = value;
    }

    static updatePin(dot, position) {
        dot.setAttribute("cx", position.x);
        dot.setAttribute("cy", position.y);
    }

    static updateLine(line, polyStr) {
        line.setAttribute("points", polyStr);
    }

    static getPolyStr(line) {
        return line.getAttribute("points");
    }
}
