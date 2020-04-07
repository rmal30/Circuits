var svg = document.getElementById("svg");
var pins = [];
var lines = [];
var moving = {comp: false, dot: false};
var selected = {comp: false, node: false, line: false};
var pinCount = 0;
var imgSize = 48;
var gridSize = 6;
var dotSize = 4;
var hertz = 60;
var moveID, prevPointID, selectID;
var pointExists;
var components = [];

chooseMode();

function simulate(){
    var currentSets = getCurrents();
    var voltageSets = getVoltages();
    var impComponents = getComponents(components, ["res", "cap", "ind", "dio"]);
    var diodeCount;
    var validIndex;
    var valid;
    for(var i = 0; i < currentSets.length; i++){
        diodeCount = 0;
        valid = true;
        for(var j = 0; j < currentSets[i].length; j++){
            if(impComponents[j].type === "dio"){
                var state = (i & (1 << diodeCount)) !== 0;
                var invalidOffState = !state && (currentSets[i][j][0] !== 0 || voltageSets[i][j][0] > 0);
                var invalidOnState = state && (currentSets[i][j][0] < 0 || voltageSets[i][j][0] < 0);
                if(invalidOffState || invalidOnState){
                    valid = false;
                }else if(isNaN(currentSets[i][j]) || isNaN(voltageSets[i][j])){
                    valid = false;
                }
                diodeCount++;
            }
        }
        if(valid){
            validIndex = i;
            break;
        }
    }

    var diodes = getComponents(components, ["dio"]);
    for(var i = 0; i < diodes.length; i++){
        diodes[i].value = (validIndex & (1 << i)) !== 0;
    }

    var infoDiv = document.getElementById("info");
    if(!valid){
        infoDiv.innerHTML = "No solution found";
        return;
    }
    infoDiv.innerHTML = "";
    infoDiv.innerHTML += "<br/><br/> Nodal analysis:<br/>" + impComponents.map((value, i) => `${value.type}_${value.id}: ${printComplex(voltageSets[validIndex][i][0])}V`).join("<br/>");
    infoDiv.innerHTML += "<br/><br/> Mesh analysis:<br/>" + impComponents.map((value, i) => `${value.type}_${value.id}: ${printComplex(currentSets[validIndex][i][0])}A`).join("<br/>");
    infoDiv.innerHTML += "<br/><br/> Component list:<br/>" + impComponents.map((value, i) => `${value.type}_${value.id}: ${JSON.stringify(impComponents[i])}`).join("<br/>");
}

function chooseMode(){
    var mode = document.getElementById("mode");
    var freq2 = document.getElementById("freq2");
    var compList = document.getElementById("newComp");

    var componentsList = {
        ac: {cap: "Capacitor", ind: "Inductor", vac: "AC Voltage", iac: "AC Current"},
        dc: {
            vdc: "DC Voltage",
            idc: "DC Current",
            dio: "Diode",
            vccs: "Voltage controlled current source",
            cccs: "Current controlled current source",
            vcvs: "Voltage controlled voltage source",
            ccvs: "Current controlled voltage source"
        }
    };

    compList.options.length = 2;
    if(mode.value === "ac"){
        freq2.className = freq2.className.replace(" is-disabled", "");
        document.getElementById("freq").disabled = false;
        for(var acComp in componentsList.ac){
            compList.options[compList.options.length] = (new Option(componentsList.ac[acComp], acComp));
        }

        for(var i = 0; i < components.length; i++){
            if(components[i].type in componentsList.dc){
                deleteComponent(i);
            }
        }
    }else{
        freq2.className += " is-disabled";
        document.getElementById("freq").disabled = true;
        for(var dcComp in componentsList.dc){
            compList.options[compList.options.length] = new Option(componentsList.dc[dcComp], dcComp);
        }

        for(var i = 0; i < components.length; i++){
            if(components[i].type in componentsList.ac){
                deleteComponent(i);
            }
        }
    }
}

function changeFreq(value){
    hertz = parseFloat(value);
}

// Add component to diagram
function addComponent(type, pos){
    var compStr = "";
    var newCompInfo = info[type];
    var directionStr = document.getElementById("newCompDir").value;
    var direction = directions[directionStr];
    var value;
    if(newCompInfo.prop){
        value = promptValue(newCompInfo);
        if(value === null){
            return "";
        }
    }
    pos = pos.offset(-pos.x % gridSize, -pos.y % gridSize);
    var cPos = pos.offset(0, -imgSize / 2);
    var id = components.length;
    var pinDir = getPinDirections(direction, info[type].pinCount);
    var pinPos = getPinPositions(pos, direction, info[type].pinCount);
    console.log(pinPos, pinDir);
    components.push({id: id, type: type, value: value, direction: pinDir[0], pins: range(pinCount, pinCount + info[type].pinCount), pos: cPos});
    compStr = drawComponent(id, newCompInfo, directionStr, value, pos, pinCount);
    for(var i=0; i<info[type].pinCount; i++){
        pins[pinCount + i] = {pos: pinPos[i], comp: id, lines: [], direction: pinDir[i]};
    }
    pinCount += info[type].pinCount;
    return compStr;
}

// Handle node selection
function handleNode(id){
    moving.dot = true;
    selected.node = true;
    selected.comp = false;
    moveID = id;
    selectID = id;
}

// Draw line between two components
function drawLine(id, createNewNode){
    if(pointExists){
        deselect(prevPointID, "Node");
        pointExists = false;
        if(id !== prevPointID){
            if(createNewNode){
                if(id.split("_").indexOf(prevPointID) !== -1){
                    return;
                }else{
                    var pos = new Position(event.clientX, event.clientY).offset(-10, -28);
                    pos = pos.offset(-pos.x % gridSize, -pos.y % gridSize);
                    id = createNode(id, pos);
                }
            }
            var lineID = prevPointID + "_" + id;
            if(lines.indexOf(lineID) === -1){
                lines.push(lineID);
                pins[prevPointID].lines.push(lines.length - 1);
                pins[id].lines.push(lines.length - 1);
                svg.innerHTML += drawPolyLine(lineID, findPolyStr(pins, prevPointID, id));
            }
        }
    }else if(!createNewNode){
        select(id, "Node");
        prevPointID = id;
        pointExists = true;
    }else{
        if(selected.comp){
            deselect(selectID, "Component");
        }
        selected.comp = false;

        if(selected.node){
            deselect(selectID, "Node");
        }
        selected.node = false;

        select(id, "Line");
        selected.line = true;
        selectID = id;
    }
}

// Create a node that connects 3 or more components
function createNode(lineID, pos){
    var lineIDs = lineID.split("_");
    var line1 = document.getElementById(lineID);
    var lineID1 = lineIDs[0] + "_" + pinCount;
    var lineID2 = lineIDs[1] + "_" + pinCount;
    line1.setAttribute("id", lineID1);
    var lineIndex1 = lines.indexOf(lineID);
    lines[lineIndex1] = lineID1;
    var lineIndex2 = lines.length;
    lines.push(lineID2);
    var lines2 = pins[lineIDs[1]].lines;
    lines2[lines2.indexOf(lineIndex1)] = lineIndex2;
    pins[pinCount] = {pos: pos, comp: "", lines: [lineIndex1, lineIndex2], direction: ""};
    line1.setAttribute("onclick", `drawLine('${lineID1}', true)`);
    line1.setAttribute("points", findPolyStr(pins, lineIDs[0], pinCount));
    svg.innerHTML += drawPolyLine(lineID2, findPolyStr(pins, lineIDs[1], pinCount)) + drawNode(pinCount, pos);
    pinCount++;
    return pinCount - 1;
}

// Start move
function startMove(id){
    moving.comp = true;
    moveID = id;
}

// Stop move
function stopMove(){
    moving.comp = false;
    if(moving.dot){
        drawLine(moveID, false);
    }
    moving.dot = false;
}

// Move node
function moveNode(pos){
    var cPos = pos.offset(-dotSize, -imgSize / 2 - 3);
    cPos = cPos.offset(-cPos.x % gridSize, -cPos.y % gridSize);
    movePin(moveID, cPos);
    pins[moveID].pos = cPos;
    pins[moveID].lines.forEach(line => adjustLine(pins, lines[line]));
}

// Move component
function moveComponent(pos){
    pos = pos.offset(-pos.x % gridSize, -pos.y % gridSize);
    var comp = components[moveID];
    var halfImgSize = imgSize / 2;
    var pplPos = getLabelPinPos(pos, comp.direction, comp.pins.length);
    var cPos = pos.offset(0, -halfImgSize);
    changeComponentPosition(comp, moveID, pos, pplPos);
    comp.pos = cPos;

    for(var i=0; i<pplPos.length - 1; i++){
        pins[comp.pins[i]].pos = pplPos[i];
    }
    var componentLines = comp.pins.map(pinId => pins[pinId].lines);
    for(var i = 0; i < componentLines.length; i++){
        componentLines[i].forEach(line => adjustLine(pins, lines[line]));
    }
}

// Rotate a component
function rotateComponent(id){
    var comp = components[id];
    var halfImgSize = imgSize / 2;
    comp.direction = rotateVector(comp.direction);
    console.log(comp.direction);
    var pplPos = getLabelPinPos(comp.pos.offset(0, halfImgSize), comp.direction, comp.pins.length);
    changeComponentPosition(comp, id, comp.pos.offset(0, halfImgSize), pplPos);
    var directions = getPinDirections(comp.direction, comp.pins.length);
    for(var i=0; i<comp.pins.length; i++){
        pins[comp.pins[i]].direction = directions[i];
    }

    for(var i=0; i<pplPos.length - 1; i++){
        pins[comp.pins[i]].pos = pplPos[i];
    }
    var componentLines = comp.pins.map(pinId => pins[pinId].lines);
    for(var i = 0; i < componentLines.length; i++){
        componentLines[i].forEach(line => adjustLine(pins, lines[line]));
    }
}

function rotateVector(vec){
    return [-vec[1], vec[0]];
}

function deleteNode(id){
    svg.removeChild(document.getElementById("pin-" + id));
    var pin = pins[id];
    while(pin.lines.length > 0){
        deleteLine(pin.lines[0]);
    }
    pins[id] = {};
    selected.node = false;
    pointExists = false;
}

function deleteComponent(id){
    var comp = components[id];
    var elements = comp.pins.map(pinId => "pin-" + pinId).concat(["img" + id, "txt" + id]);
    pointExists = pointExists && (!comp.pins.includes(prevPointID));
    elements.forEach(element => svg.removeChild(document.getElementById(element)));
    comp.pins.forEach(pin => deleteLines(pins[pin]));
    components[id] = {};
    selected.comp = false;
}

function deleteLines(pin){
    while(pin.lines.length > 0){
        deleteLine(pin.lines[0]);
    }
    for(var key in pin){
        delete pin[key];
    }
}

function deleteLine(lineIndex){
    svg.removeChild(document.getElementById(lines[lineIndex]));
    var linePins = lines[lineIndex].split("_");
    lines[lineIndex] = "";
    var pinLines = [pins[linePins[0]].lines, pins[linePins[1]].lines];
    pinLines[0].splice(pinLines[0].indexOf(lineIndex), 1);
    pinLines[1].splice(pinLines[1].indexOf(lineIndex), 1);
}

// Update component value
function updateValue(id){
    var compInfo = info[components[id].type];
    var value = promptValue(compInfo);
    if(value !== null){
        components[id].value = value;
        document.getElementById("txt" + id).innerHTML = value + " " + compInfo.unit;
    }
}

// Drag component
svg.addEventListener("mousemove", function(){
    var pos = new Position(window.event.clientX, window.event.clientY - 32);
    if(moving.comp){
        moveComponent(pos);
    }else if(moving.dot){
        moveNode(pos);
    }
});

// Add component
svg.addEventListener("click", function(){
    var pos = new Position(window.event.clientX, window.event.clientY).offset(0, -32);
    var listen = true;
    var image;
    var pin;
    var dx, dy;
    moving.comp = false;
    moving.dot = false;
    for(var i = 0; i < components.length; i++){
        if(Object.keys(components[i]).length > 0){
            image = document.getElementById("img" + i);
            dx = Math.abs(pos.x - image.x.baseVal.value - (imgSize / 2));
            dy = Math.abs(pos.y - image.y.baseVal.value - imgSize);
            if(dx < imgSize * 0.4 && dy < imgSize * 0.4){
                listen = false;
                if(selected.comp && selectID !== i){
                    deselect(selectID, "Component");
                    selected.comp = false;
                }

                if(!selected.comp){
                    select(i, "Component");
                    selected.comp = true;
                    selectID = i;
                }
            }
        }
    }
    for(var i = 0; i < pins.length; i++){
        if(Object.keys(pins[i]).length > 0){
            pin = document.getElementById("pin-" + i);
            if(Math.abs(pos.x - pin.cx.baseVal.value) < 20 && Math.abs(pos.y - pin.cy.baseVal.value - (imgSize / 2)) < 20){
                listen = false;
            }
        }
    }
    if(listen){
        var newCompType = document.getElementById("newComp").value;
        if(pointExists){
            deselect(prevPointID, "Node");
            pointExists = false;
        }else if(selected.comp){
            deselect(selectID, "Component");
            selected.comp = false;
        }else if(newCompType !== " "){
            svg.innerHTML += addComponent(newCompType, pos);
        }
    }
});

// Detect keys to rotate and delete components
document.addEventListener("keydown", function(event){
    var key = event.keyCode ? event.keyCode : event.which;
    if(selected.node){
        if(key === 46){
            deleteNode(selectID);
        }
    }
    if(selected.comp){
        switch(key){
            case 82: rotateComponent(selectID); break;
            case 46: deleteComponent(selectID); break;
        }
    }

    if(selected.line){
        if(key === 46){
            if(lines.indexOf(selectID) !== -1){
                deleteLine(lines.indexOf(selectID));
            }
            selected.line = false;
        }

        if(key === 27){
            deselect(selectID, "Line");
            selected.line = false;
        }
    }
});
