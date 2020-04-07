var imgSize = 48;
var dotSize = 4;

var res = {name: "Resistor", init: "res", prop: "Resistance", unit: "\u03A9", pinCount: 2};
var cap = {name: "Capacitor", init: "cap", prop: "Capacitance", unit: "\u00B5F", pinCount: 2};
var ind = {name: "Inductor", init: "ind", prop: "Inductance", unit: "mH", pinCount: 2};
var dio = {name: "Diode", init: "dio", pinCount: 2};
var vdc = {name: "DC Voltage source", init: "vdc", prop: "Voltage", unit: "V", pinCount: 2};
var vac = {name: "AC voltage source", init: "vac", prop: "Phasor voltage", unit: "V", pinCount: 2};
var idc = {name: "DC Current source", init: "idc", prop: "Current", unit: "A", pinCount: 2};
var iac = {name: "AC Current source", init: "iac", prop: "Phasor Current", unit: "A", pinCount: 2};
var vcvs = {name: "Voltage controlled voltage source", init: "vcvs", prop: "Gain", unit: "", pinCount: 4};
var ccvs = {name: "Current controlled voltage source", init: "ccvs", prop: "Gain", unit: "\u03A9", pinCount: 4};
var vccs = {name: "Voltage controlled current source", init: "vccs", prop: "Gain", unit: "S", pinCount: 4};
var cccs = {name: "Current controlled current source", init: "cccs", prop: "Gain", unit: "", pinCount: 4};
var info = {res: res, cap: cap, ind: ind, vdc: vdc, vac: vac, idc: idc, iac: iac, dio: dio, vcvs: vcvs, ccvs: ccvs, vccs: vccs, cccs: cccs};

var styles = {
    select: {
        Line: {stroke: "blue"},
        Component: {opacity: 0.7},
        Node: {fill: "blue"}
    },
    deselect: {
        Line: {stroke: "black"},
        Component: {opacity: 1},
        Node: {fill: "black"}
    }
};

var defaultLineStyle = {
    fill: "none",
    stroke: "black",
    "stroke-width": 2
};

var directions = {
    "H": [1, 0],
    "V": [0, 1]
}

// Prompt value from user
function promptValue(info){
    var promptStr = `Please enter a ${info.prop} for a ${info.name} in ${info.unit}`;
    var value = prompt(promptStr);
    while(value === ""){
        alert("Please enter a valid value");
        value = prompt(promptStr);
    }
    return value;
}

function adjustLine(pins, lineId){
    var line = document.getElementById(lineId);
    var linePins = lineId.split("_");
    line.setAttribute("points", findPolyStr(pins, linePins[0], linePins[1]));
}

function getLabelPinPos(pos, direction, count){
    var rightPos = pos.offset(imgSize / 2, -imgSize / 2);
    var bottomPos = pos.offset(0, imgSize / 8);
    var points = getPinPositions(pos, direction, count);
    if(direction[0] === 0){
        points.push(rightPos.offset(8, 5));
    }else if(direction[1] === 0){
        points.push(bottomPos);
    }

    return points;
}

// Position class
function Position(x, y){
    this.x = x;
    this.y = y;
    this.show = function(){
        return this.x + " " + this.y;
    };
    this.coords = function(){
        return [this.x, this.y];
    };
    this.offset = function(x, y){
        var pos = new Position(this.x, this.y);
        pos.x += x;
        pos.y += y;
        return pos;
    };
}

function getPinPositions(pos, direction, count){
    var centerPos = pos.offset(0, -imgSize / 2);
    var posTemplate = {
        1: [0, 0],
        2: [[0.5, 0], [-0.5, 0]],
        4: [[0.5, 0.25], [0.5, -0.25], [-0.5, 0.25], [-0.5, -0.25]]
    };
    return posTemplate[count].map(point => centerPos.offset.apply(centerPos, multiplyC(imgSize, multiplyC(point, direction))));
}

function getPinDirections(direction, count){
    var dirTemplate = {
        2: [[1, 0], [-1, 0]],
        4: [[1, 0], [1, 0], [-1, 0], [-1, 0]]
    };
    return dirTemplate[count].map(point => multiplyC(point, direction));
}

function getAngleFromDirection(direction){
    var angle = 0;
    switch(direction.toString()){
        case "0,1": angle = 90; break;
        case "0,-1": angle = -90; break;
        case "1,0": angle = 0; break;
        case "-1,0": angle = 180; break;
        default: throw new Error("Invalid direction");
    }
    return angle;
}

function drawPolyLine(lineID, points){
    var style = "";
    for(var prop in defaultLineStyle){
        style += `${prop}:${defaultLineStyle[prop]};`;
    }
    return generateXML("polyline", {id: lineID, points: points, style: style, onclick: `drawLine('${lineID}', true)`}, null);
}

function drawComponent(id, newCompInfo, directionStr, value, pos, pinCount){
    var adjustedPos = pos.offset(-imgSize / 2, -imgSize);
    var rightPos = pos.offset(imgSize / 2, -imgSize / 2);
    var cPos = pos.offset(0, -imgSize / 2);
    var bottomPos = pos;
    var pos3;
    var angle;

    var direction = directions[directionStr];
    if(directionStr === "H"){
        pos3 = bottomPos.offset(0, imgSize/8);
        angle = 0;
    }else{
        pos3 = rightPos.offset(8, 5);
        angle = 90;
    }

    var compStr = "";
    compStr += generateXML("image", {
        id: "img" + id,
        "xlink:href": `images/${newCompInfo.init}.png`,
        x: adjustedPos.x,
        y: adjustedPos.y,
        height: imgSize,
        width: imgSize,
        onmousedown: `startMove('${id}')`,
        onmouseup: "stopMove()",
        transform: `rotate(${angle} ${cPos.coords()})`
    }, null);

    compStr += generateXML("text", {
        x: pos3.x,
        y: pos3.y,
        id: "txt" + id,
        "text-anchor": "middle",
        style: "user-select:none;",
        onclick: "updateValue('" + id + "')"
    }, value ? (value + " " + newCompInfo.unit) : "");

    var pinPositions = getPinPositions(pos, direction, newCompInfo.pinCount);
    for(var i = 0; i < pinPositions.length; i++){
        compStr += generateXML("circle", {
            id: "pin-" + (pinCount + i),
            cx: pinPositions[i].x,
            cy: pinPositions[i].y,
            r: dotSize,
            onclick: "drawLine('" + (pinCount + i) + "', false)"
        }, null);
    }
    return compStr;
}

function generateXML(tag, properties, value){
    var xml = `<${tag}`;
    for(var prop in properties){
        xml += ` ${prop}="${properties[prop]}"`;
    }
    if(value){
        xml += `>${value}</${tag}>`;
    }else{
        xml += "/>";
    }
    return xml;
}

function drawNode(id, pos){
    return generateXML("circle", {
        id: `pin-${id}`,
        cx: pos.x,
        cy: pos.y,
        r: dotSize,
        onmousedown: `handleNode('${id}')`,
        onmouseup: "stopMove()"
    }, null);
}

// Plan a line which can connect two components
function findPolyStr(pins, pinId0, pinId1){
    var pin0 = pins[pinId0];
    var pin1 = pins[pinId1];
    var origin = pin0.pos;
    var dest = pin1.pos;
    var dir0 = pin0.direction;
    var dir1 = pin1.direction;
    var dx = dest.x - origin.x;
    var dy = dest.y - origin.y;
    var mid = origin.offset(dx * 0.5, dy * 0.5);
    var min = new Position(Math.min(origin.x, dest.x), Math.min(origin.y, dest.y));
    var max = new Position(Math.max(origin.x, dest.x), Math.max(origin.y, dest.y));
    var polyLinePoints = [];
    var midPoints = [];
    var halfImgSize = imgSize / 2;
    if(!dir0){ dir0 = [dx * Math.abs(dir1[1]), dy * Math.abs(dir1[0])]; }
    if(!dir1){ dir1 = [-dx * Math.abs(dir0[1]), -dy * Math.abs(dir0[0])]; }
    var sx = dir1[0] * dir0[0] > 0;
    if(dir0 && dir1){
        if(dir0[1] === 0 && dir1[1] === 0){
            if(sx){
                if(Math.abs(dy) > halfImgSize){
                    if(dir1[0] < 0){
                        midPoints.push([min.x - halfImgSize, origin.y]);
                        midPoints.push([min.x - halfImgSize, dest.y]);
                    }else{
                        midPoints.push([max.x + halfImgSize, origin.y]);
                        midPoints.push([max.x + halfImgSize, dest.y]);
                    }
                }else if(Math.abs(dy) < imgSize){
                    midPoints.push([origin.x + dir0[0] * halfImgSize, origin.y]);
                    if(dy * dx * dir1[0] >= 0){
                        midPoints.push([origin.x + dir0[0] * halfImgSize, max.y - halfImgSize]);
                        midPoints.push([dest.x + dir1[0] * halfImgSize, max.y - halfImgSize]);
                    }else{
                        midPoints.push([origin.x + dir0[0] * halfImgSize, min.y + halfImgSize]);
                        midPoints.push([dest.x + dir1[0] * halfImgSize, min.y + halfImgSize]);
                    }
                    midPoints.push([dest.x + dir1[0] * halfImgSize, dest.y]);
                }else{
                    midPoints.push([mid.x, origin.y]);
                    midPoints.push([mid.x, dest.y]);
                }
            }else{
                if(dx * dir0[0] >= 0 && (Math.abs(dx) > imgSize || Math.abs(dy) < imgSize)){
                    midPoints.push([mid.x, origin.y]);
                    midPoints.push([mid.x, dest.y]);
                }else{
                    midPoints.push([origin.x + dir0[0] * halfImgSize, origin.y]);
                    if(Math.abs(dy) >= imgSize){
                        midPoints.push([origin.x + dir0[0] * halfImgSize, mid.y]);
                        midPoints.push([dest.x + dir1[0] * halfImgSize, mid.y]);
                    }else{
                        midPoints.push([origin.x + dir0[0] * halfImgSize, min.y - halfImgSize]);
                        midPoints.push([dest.x + dir1[0] * halfImgSize, min.y - halfImgSize]);
                    }
                    midPoints.push([dest.x + dir1[0] * halfImgSize, dest.y]);
                }
            }
        }else if(dir0[0] === 0 && dir1[0] === 0){
            if(dy * dir0[1] > 0 && dy * dir1[1] < 0 && Math.abs(dy) > imgSize){
                midPoints.push([origin.x, mid.y]);
                midPoints.push([dest.x, mid.y]);
            }else if(dir1[1] * dir0[1] > 0 && Math.abs(dx) > halfImgSize){
                if(dir1[1] < 0){
                    midPoints.push([origin.x, min.y - imgSize]);
                    midPoints.push([dest.x, min.y - imgSize]);
                }else{
                    midPoints.push([origin.x, max.y + imgSize]);
                    midPoints.push([dest.x, max.y + imgSize]);
                }
            }else if(Math.abs(dx) > imgSize){
                midPoints.push([origin.x, origin.y + dir0[1] * halfImgSize]);
                midPoints.push([mid.x, origin.y + dir0[1] * halfImgSize]);
                midPoints.push([mid.x, dest.y + dir1[1] * halfImgSize]);
                midPoints.push([dest.x, dest.y + dir1[1] * halfImgSize]);
            }else if(dy * dir0[1] < 0 || dy * dir1[1] > 0){
                midPoints.push([origin.x, origin.y + dir0[1] * halfImgSize]);
                if(dir1[1] * dir0[1] > 0){
                    if(dx * dy * dir1[1] >= 0){
                        midPoints.push([max.x - halfImgSize, origin.y + dir0[1] * halfImgSize]);
                        midPoints.push([max.x - halfImgSize, dest.y + dir1[1] * halfImgSize]);
                    }else{
                        midPoints.push([min.x + halfImgSize, origin.y + dir0[1] * halfImgSize]);
                        midPoints.push([min.x + halfImgSize, dest.y + dir0[1] * halfImgSize]);
                    }
                }else{
                    midPoints.push([min.x - halfImgSize, origin.y + dir0[1] * halfImgSize]);
                    midPoints.push([min.x - halfImgSize, dest.y + dir1[1] * halfImgSize]);
                }
                midPoints.push([dest.x, dest.y + dir1[1] * halfImgSize]);
            }else{
                midPoints.push([origin.x, mid.y]);
                midPoints.push([dest.x, mid.y]);
            }
        }else if(dir0[0] === 0 && dir1[1] === 0){
            if(dy * dir0[1] > 0 && dx * dir1[0] < 0){
                midPoints.push([origin.x, dest.y]);
            }else{
                midPoints.push([dest.x, origin.y]);
            }
        }else{
            if(dx * dir0[0] > 0 && dy * dir1[1] < 0){
                midPoints.push([dest.x, origin.y]);
            }else{
                midPoints.push([origin.x, dest.y]);
            }
        }
    }

    polyLinePoints.push(origin.coords());
    polyLinePoints = polyLinePoints.concat(midPoints);
    polyLinePoints.push(dest.coords());
    return polyLinePoints.map(point => point.join(", ")).join(" ");
}

function changeComponentPosition(comp, id, pos, pplPos){
    var halfImgSize = imgSize / 2;
    var adjustedPos = pos.offset(-halfImgSize, -imgSize);
    var cPos = pos.offset(0, -halfImgSize);

    for(var i=0; i<comp.pins.length; i++){
        movePin(comp.pins[i], pplPos[i]);
    }

    var text = document.getElementById("txt" + id);
    text.setAttribute("x", pplPos.slice(-1)[0].x);
    text.setAttribute("y", pplPos.slice(-1)[0].y);

    var img = document.getElementById("img" + id);
    img.setAttribute("x", adjustedPos.x);
    img.setAttribute("y", adjustedPos.y);

    var angle = getAngleFromDirection(comp.direction);
    img.setAttribute("transform", `rotate(${angle} ${cPos.coords()})`);
}

function getElement(id, type){
    var prefixes = {
        Line: "",
        Component: "img",
        Node: "pin-"
    };
    return document.getElementById(prefixes[type] + id);
}

// Deselect component or line
function deselect(id, type){
    Object.assign(getElement(id, type).style, styles.deselect[type]);
}

// Select component or line
function select(id, type){
    Object.assign(getElement(id, type).style, styles.select[type]);
}

function movePin(pinID, pos){
    var dot0 = getElement(pinID, "Node");
    dot0.setAttribute("cx", pos.x);
    dot0.setAttribute("cy", pos.y);
}
