var svg = document.getElementById("svg");
var pins = [];
var lines = [];
var moveComp = false, moveDot = false;
var selectComp = false, selectNode = false, selectLine = false;
var pinCount = 0;
var imgSize = 48, gridSize = 6, dotSize = 4;
var hertz = 60;
var moveID, prevPointID, selectID;
var pointExists;
var components=[];

chooseMode();

function chooseMode(){
    var mode = document.getElementById("mode");
    var freq2 = document.getElementById("freq2");
   
    var compList = document.getElementById("newComp");

    var acComponents = [["Capacitor", "cap"], ["Inductor", "ind"], ["AC Voltage", "vac"], ["AC Current", "iac"]];
    var dcComponents = [["DC Voltage", "vdc"], ["DC Current", "idc"]];
    compList.options.length = 2; 
    if(mode.value === "ac"){
        freq2.className= freq2.className.replace(" is-disabled", "");
        document.getElementById("freq").disabled = false;
        for(var i=0; i<acComponents.length; i++){
            compList.options[2 + i] = new Option(acComponents[i][0], acComponents[i][1]);
        }
        
        for(var i=0; i<components.length; i++){
            if(components[i].type === "vdc" || components[i].type === "idc"){
                deleteComponent(i);
            }
        }

    }else{
        freq2.className+=" is-disabled";
        document.getElementById("freq").disabled = true;
        for(var i=0; i<dcComponents.length; i++){
            compList.options[2 + i] = new Option(dcComponents[i][0], dcComponents[i][1]);
        }

        for(var i=0; i<components.length; i++){
            if(components[i].type === "vac" || components[i].type === "iac" || components[i].type === "cap" || components[i].type==="ind"){
                deleteComponent(i);
            }
        }
    }
}

function changeFreq(value){
    hertz = parseFloat(value);
}

//Add component to diagram
function addComponent(type, pos){
    var compStr = "";
    var newCompInfo = info[type];
    var direction = document.getElementById("newCompDir").value;
    var value = promptValue(newCompInfo);
    if(value!=null){
        pos = pos.offset(-pos.x%gridSize, -pos.y%gridSize);
        var cPos = pos.offset(0, -imgSize/2);
        var id = components.length;
        var pinDir = getPinDirections(direction);
        var pinPos = getPinPositions(pos, direction);
        components.push({id:id, type:type, value:value, direction:pinDir[1], pins:[pinCount, pinCount+1], pos: cPos});
        compStr = drawComponent(id, newCompInfo, direction, value, pos, pinCount);
        pins[pinCount] = {pos: pinPos[0], comp:id, lines:[], direction:pinDir[0]};
        pins[pinCount+1] = {pos: pinPos[1], comp:id, lines:[], direction:pinDir[1]};
        pinCount+=2;
    }
    return compStr;
}

//Handle node selection
function handleNode(id){
    moveDot = true;
    selectNode = true;
    selectComp = false;
    moveID = id;
    selectID = id;
}

//Draw line between two components
function drawLine(id, createNewNode){
    if(pointExists){
        deselect(prevPointID, "Node");
        pointExists = false;
        if(id!==prevPointID){
            if(createNewNode){
                if(id.split("_").indexOf(prevPointID) !== -1){
                    return;
                }else{
                    var pos = new Position(event.clientX, event.clientY).offset(-10, -28);
                    pos = pos.offset(-pos.x % gridSize, -pos.y % gridSize);
                    id = createNode(id, pos);
                }
            }
            var lineID = prevPointID+'_'+id;
            if(lines.indexOf(lineID)===-1){
                lines.push(lineID);
                pins[prevPointID].lines.push(lines.length-1);
                pins[id].lines.push(lines.length-1);
                svg.innerHTML += drawPolyLine(lineID, findPolyStr(pins, prevPointID, id));
            }
        }
    }else if(!createNewNode){
        select(id, "Node"); 
        prevPointID = id;
        pointExists = true;
    }else{
        if(selectComp){
            deselect(selectID, "Component"); 
            selectComp = false;
       }

        if(selectNode){
            deselect(selectID, "Node");
            selectNode = false;
        }

        select(id, "Line");
        selectLine = true;
        selectID = id;
    }
}    

//Create a node that connects 3 or more components
function createNode(lineID, pos){
    var lineIDs = lineID.split("_");
    var line1 = document.getElementById(lineID);
    var lineID1 = lineIDs[0]+"_"+pinCount;
    var lineID2 = lineIDs[1]+"_"+pinCount;
    line1.setAttribute("id", lineID1);
    var lineIndex1 = lines.indexOf(lineID);
    lines[lineIndex1] = lineID1;
    var lineIndex2 = lines.length;
    lines.push(lineID2);
    var lines2 = pins[lineIDs[1]].lines;
    lines2[lines2.indexOf(lineIndex1)] = lineIndex2;
    pins[pinCount] = {pos: pos, comp:"",lines: [lineIndex1, lineIndex2], direction:""};
    line1.setAttribute("onclick", 'drawLine(\''+lineID1+'\', true)');
    line1.setAttribute("points", findPolyStr(pins, lineIDs[0], pinCount));
    svg.innerHTML+= drawPolyLine(lineID2, findPolyStr(pins, lineIDs[1], pinCount)) + drawNode(pinCount, pos);
    pinCount++;
    return (pinCount-1);
}

//Start move
function move(id){
    moveComp = true;
    moveID = id;
}

//Stop move
function stopMove(){ 
    moveComp = false;
    if(moveDot){
        drawLine(moveID, false);
    }
    moveDot = false;
}

//Move node
function moveNode(pos){
    var cPos = pos.offset(-dotSize, -imgSize/2-3);
    cPos = cPos.offset(-cPos.x%gridSize,-cPos.y%gridSize);
    movePin(moveID, cPos);
    var lines1 = pins[moveID].lines;
    pins[moveID].pos = cPos;
    for(var i=0; i<lines1.length; i++){
        adjustLine(pins, lines[lines1[i]]);
    }
}

//Move component
function moveComponent(pos){
    pos = pos.offset(-pos.x%gridSize, -pos.y%gridSize);
    var halfImgSize = imgSize/2;
    var comp = components[moveID];
    var pplPos = getLabelPinPos(pos, comp.direction);
    var cPos = pos.offset(0, -halfImgSize);
    changeComponentPosition(comp, moveID, pos, pplPos);
    var lines1 = pins[comp.pins[0]].lines;
    var lines2 = pins[comp.pins[1]].lines;
    pins[comp.pins[0]].pos = pplPos[0];
    pins[comp.pins[1]].pos = pplPos[1];
    comp.pos = cPos;
    for(var i=0; i<lines1.length; i++){
        adjustLine(pins, lines[lines1[i]]);
    }
    for(var i=0; i<lines2.length; i++){
        adjustLine(pins, lines[lines2[i]]);
    }
}

//Rotate a component
function rotateComponent(id){
    var comp = components[id];
    var pos = comp.pos;
    
    var halfImgSize = imgSize/2;
    var dir1, dir2;

    if(comp.direction[0]===0){
        comp.direction = [-comp.direction[1], 0];
    }else if(comp.direction[1]===0){
        comp.direction = [0, comp.direction[0]];
    }

    dir2 = comp.direction;
    
    var pplPos = getLabelPinPos(pos.offset(0, halfImgSize), comp.direction);

    if(comp.direction[0]===0){
        dir1 = [0,-comp.direction[1]];
    }else if(comp.direction[1]===0){
        dir1 = [-comp.direction[0],0];
    }
    
    changeComponentPosition(comp, id, pos.offset(0, halfImgSize), pplPos);
    var pinIds = comp.pins;
    var lines1 = pins[pinIds[0]].lines;
    var lines2 = pins[pinIds[1]].lines;
    pins[pinIds[0]].pos = pplPos[0];
    pins[pinIds[1]].pos = pplPos[1];
    pins[pinIds[0]].direction = dir1;
    pins[pinIds[1]].direction = dir2;
    for(var i=0; i<lines1.length; i++){
        adjustLine(pins, lines[lines1[i]]);
    }
    for(var i=0; i<lines2.length; i++){
        adjustLine(pins, lines[lines2[i]]);
    }
}

function deleteComponent(id){
    var comp = components[id];
    var elements = ["pin-"+comp.pins[0], "pin-"+comp.pins[1], "img"+id, "txt"+id];

    if(pointExists && (prevPointID == comp.pins[0] || prevPointID == comp.pins[1])){
        pointExists = false;
    }

    for(var i=0; i<elements.length; i++){
        svg.removeChild(document.getElementById(elements[i]));
    }
    deleteLines(pins[comp.pins[0]]);
    deleteLines(pins[comp.pins[1]]);
    components[id] = {};
    selectComp = false;
}

function deleteLines(pin){
    while(pin.lines.length>0){
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

//Update component value
function updateValue(id){
    var compInfo = info[components[id].type];
    var value = promptValue(compInfo);
    if(value!=null){
        components[id].value = value;
        document.getElementById("txt"+id).innerHTML = value+" "+compInfo.unit;
    }
}

//Drag component
svg.addEventListener("mousemove", function(){
    var pos = new Position(window.event.clientX, window.event.clientY-40);
    if(moveComp){
        moveComponent(pos);
    }else if(moveDot){
        moveNode(pos);
    }
});

//Add component
svg.addEventListener("click", function(){
    var pos = new Position(window.event.clientX, window.event.clientY).offset(-10, -70);
    var listen = true;
    var image;
    var pin;
    var dx, dy;
    moveComp = false;
    moveDot = false;
    for(var i=0; i<components.length; i++){
        if(Object.keys(components[i]).length>0){
            image = document.getElementById("img"+i);
            dx = Math.abs(pos.x - image.x.baseVal.value);
            dy = Math.abs(pos.y - image.y.baseVal.value);
            if(dx < imgSize * 0.8 && dy < imgSize * 0.8){
                listen = false;
                if(selectComp && selectID != i){
                    deselect(selectID, "Component");
                    selectComp = false;
                }

                if(!selectComp){
                    select(i, "Component");
                    selectComp = true;
                    selectID = i;
                }
            }
        }
    }
    for(var i=0; i<pins.length; i++){
        if(Object.keys(pins[i]).length>0){
            pin = document.getElementById("pin-"+i);
            if(Math.abs(pos.x - pin.cx.baseVal.value)<20 && Math.abs(pos.y - pin.cy.baseVal.value)<20){
                listen = false;
            }    
        }
    }
    if(listen){
        var newCompType = document.getElementById("newComp").value;
        if(pointExists){
            deselect(prevPointID, "Node");
            pointExists = false;
        }else if(selectComp){
            deselect(selectID, "Component"); 
            selectComp = false;
        }else if(newCompType!==" "){
            svg.innerHTML+= addComponent(newCompType, pos);
        }
    }
});

//Detect keys to rotate and delete components
document.addEventListener("keydown", function (event){
    var key = event.keyCode ? event.keyCode : event.which;
    if(selectNode){
        if(key === 46){
            svg.removeChild(document.getElementById("pin-"+selectID));
            var pin = pins[selectID];
            while(pin.lines.length>0){
                deleteLine(pin.lines[0]);
            }
            pins[selectID] = {};
            selectNode = false;
            pointExists = false;
        }
    }
    if(selectComp){
        if (key === 82){
            rotateComponent(selectID);
        }else if(key === 46){
            deleteComponent(selectID);
        }
    }

    if(selectLine){
        if(key === 46){
            if(lines.indexOf(selectID)!=-1){
                deleteLine(lines.indexOf(selectID));
            }
            selectLine = false;
        }

        if(key === 27){
            deselect(selectID, "Line");
            selectLine = false;
        }
    }
});
