"use strict";

class Render {

    static setFrequencyEnabled(enabled) {
        const freq2 = document.getElementById("freq2");
        if (enabled) {
            freq2.className = freq2.className.replace(" is-disabled", "");
        } else {
            freq2.className += " is-disabled";
        }
        document.getElementById("freq").disabled = !enabled;

    }

    static setInformation(info) {
        const infoDiv = document.getElementById("info");
        infoDiv.innerHTML = info;
    }

    static setLabel(id, value, unit) {
        document.getElementById("txt" + id).innerHTML = `${value} ${unit}`;
    }

    static setComponentOptions(componentOptions) {
        const compList = document.getElementById("newComp");
        compList.options.length = 2;
        for (const component in componentOptions) {
            compList.options[compList.options.length] = new Option(componentOptions[component], component);
        }
    }

    static drawPolyLine(lineID, points) {
        const svg = document.getElementById("svg");
        let style = "";

        for (const prop in defaultLineStyle) {
            style += `${prop}:${defaultLineStyle[prop]};`;
        }
        svg.innerHTML += generateXML("polyline", {
            id: lineID,
            points: points,
            onclick: `drawLine('${lineID}', true)`,
            style: style
        }, null);
    }

    static drawComponent(id, newCompInfo, directionStr, value, pos, pinCount) {
        const svg = document.getElementById("svg");
        const adjustedPos = pos.offset(-IMAGE_SIZE / 2, -IMAGE_SIZE);
        const rightPos = pos.offset(IMAGE_SIZE / 2, -IMAGE_SIZE / 2);
        const cPos = pos.offset(0, -IMAGE_SIZE / 2);
        const bottomPos = pos;
        let pos3;
        let angle;

        const direction = directions[directionStr];
        if (directionStr === "H") {
            pos3 = bottomPos.offset(0, IMAGE_SIZE / 8);
            angle = 0;
        } else {
            pos3 = rightPos.offset(8, 5);
            angle = 90;
        }

        let compStr = "";
        compStr += generateXML("image", {
            id: "img" + id,
            "xlink:href": `images/${newCompInfo.init}.png`,
            x: adjustedPos.x,
            y: adjustedPos.y,
            height: IMAGE_SIZE,
            width: IMAGE_SIZE,
            ondragstart: "ignoreEvent(e)",
            onmousedown: `startComponentMove('${id}')`,
            onmouseup: "stopMove()",
            transform: `rotate(${angle} ${cPos.coords()})`
        }, null);

        compStr += generateXML("text", {
            x: pos3.x,
            y: pos3.y,
            id: "txt" + id,
            "text-anchor": "middle",
            style: "user-select:none;",
            ondragstart: "ignoreEvent(e)",
            onclick: `updateValue('${id}')`
        }, value ? (value + " " + newCompInfo.unit) : "");

        const pinPositions = getPinPositions(pos, direction, newCompInfo.pinCount);
        for (let i = 0; i < pinPositions.length; i++) {
            compStr += generateXML("circle", {
                id: getElementId(pinCount + i, "Node"),
                cx: pinPositions[i].x,
                cy: pinPositions[i].y,
                r: dotSize,
                onclick: `drawLine(${(pinCount + i)}, false)`
            }, null);
        }
        svg.innerHTML += compStr;
    }

    static drawNode(id, pos) {
        const svg = document.getElementById("svg");
        svg.innerHTML += generateXML("circle", {
            id: getElementId(id, "Node"),
            cx: pos.x,
            cy: pos.y,
            r: dotSize,
            onmousedown: `handleNode('${id}')`,
            onmouseup: "stopMove()"
        }, null);
    }

    static changeComponentPosition(comp, id, pos, pplPos) {
        const halfImgSize = IMAGE_SIZE / 2;
        const adjustedPos = pos.offset(-halfImgSize, -IMAGE_SIZE);
        const cPos = pos.offset(0, -halfImgSize);

        for (let i = 0; i < comp.pins.length; i++) {
            Render.movePin(comp.pins[i], pplPos[i]);
        }

        const text = document.getElementById("txt" + id);
        text.setAttribute("x", pplPos.slice(-1)[0].x);
        text.setAttribute("y", pplPos.slice(-1)[0].y);

        const img = document.getElementById("img" + id);
        img.setAttribute("x", adjustedPos.x);
        img.setAttribute("y", adjustedPos.y);

        const angle = getAngleFromDirection(comp.direction);
        img.setAttribute("transform", `rotate(${angle} ${cPos.coords()})`);
        img.setAttribute("ondragstart", "ignoreEvent(e)");
    }

    // Select or deselect component or line
    static setSelected(selected, id, type) {
        const element = document.getElementById(getElementId(id, type));
        const style = selected ? styles.select[type] : styles.deselect[type];
        Object.assign(element.style, style);
    }

    static movePin(pinID, pos) {
        const dot0 = document.getElementById(getElementId(pinID, "Node"));
        dot0.setAttribute("cx", pos.x);
        dot0.setAttribute("cy", pos.y);
    }

    static adjustLine(pins, lineId) {
        const line = document.getElementById(lineId);
        const linePins = lineId.split("_");
        line.setAttribute("points", findPolyStr(pins, linePins[0], linePins[1]));
    }

    static changeLine(lineID, lineID1, polyStr) {
        const line1 = document.getElementById(lineID);
        line1.setAttribute("id", lineID1);
        line1.setAttribute("onclick", `drawLine('${lineID1}', true)`);
        line1.setAttribute("points", polyStr);
    }

    static removeElement(id) {
        const svg = document.getElementById("svg");
        svg.removeChild(document.getElementById(id));
    }
}
