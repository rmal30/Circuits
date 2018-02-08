var svg = document.getElementById("svg");
var pins = [];
var lines = [];
var moveComp = false;
var moveDot = false;
var selectComp = false;
var selectNode = false;
var selectLine = false;
var pinCount = 0;
var imgSize = 48;
var gridSize = 6;
var dotSize = 4;
var moveID;
var prevPointID;
var selectID;
var pointExists;
var components=[];
var res = {name:"Resistor",init: "res", prop:"Resistance", unit: '\u03A9'};
var cap = {name:"Capacitor",init: "cap", prop:"Capacitance", unit: "F"};
var ind = {name:"Inductor",init: "ind", prop:"Inductance", unit: "H"};
var vdc = {name:"DC Voltage source",init: "vdc", prop:"Voltage", unit: "V"};
var vac = {name:"AC voltage source",init: "vac", prop:"Phasor voltage",unit: "V"};
var idc = {name:"DC Current source",init: "idc", prop:"Current",unit: "A"};
var info = {res:res, cap:cap, ind:ind, vdc:vdc, vac:vac, idc:idc};

//Prompt value from user
function promptValue(info){
    var promptStr = "Please enter a "+ info.prop+" for a "+info.name+" in "+info.unit;
    var value = prompt(promptStr);
    while(value===""){
        alert("Please enter a valid value");
        value = prompt(promptStr);
    }
    return value;
}

//Add component to diagram
function addComponent(type, pos){
    var compStr = "";
    var newCompInfo = info[type];
    var direction = document.getElementById("newCompDir").value;
    var value = promptValue(newCompInfo);
    if(value!=null){
        pos = pos.offset(-pos.x%gridSize, -pos.y%gridSize);
        var leftPos = pos.offset(-24, -imgSize/2);
        var rightPos = pos.offset(24, -imgSize/2);
        var topPos = pos.offset(0, -imgSize);
        var cPos = pos.offset(0, -imgSize/2);
        var bottomPos = pos;
        var pos1, pos2;
        var id = components.length;
        var dir1, dir2;

        if(direction === "H"){
            pos1 = leftPos;
            pos2 = rightPos;
            dir1 = [-1, 0];
            dir2 = [1, 0];
        }else{
            pos1 = topPos;
            pos2 = bottomPos;
            dir1 = [0,-1];
            dir2 = [0,1];
        }

        components.push({id:id, type:type, value:value, direction:dir2, pins:[pinCount, pinCount+1], pos: cPos});
        compStr = drawComponent(id, newCompInfo, direction, value, pos, pinCount);
        pins[pinCount] = {pos: pos1, comp:id, lines:[], direction:dir1};
        pins[pinCount+1] = {pos: pos2, comp:id, lines:[], direction:dir2};
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
        var prevDot = document.getElementById("pin-"+prevPointID);
        prevDot.setAttribute("fill", "black");
        pointExists = false;
        if(id!==prevPointID){
            if(createNewNode){
                var lineIDs = id.split("_");
                if(lineIDs[0]===prevPointID || lineIDs[1]===prevPointID){
                    return;
                }else{
                    var xPos = event.clientX-10;
                    var yPos = event.clientY-28;
                    var pos = new Position(xPos, yPos).offset(-xPos%gridSize, -yPos%gridSize);
                    id = createNode(id, pos);
                }
            }
            var lineID = prevPointID+'_'+id;
            if(lines.indexOf(lineID)===-1){
                var polyStr = findPolyStr(pins, prevPointID, id);
                lines.push(lineID);
                pins[prevPointID].lines.push(lines.length-1);
                pins[id].lines.push(lines.length-1);
                svg.innerHTML += drawPolyLine(lineID, polyStr);
            }
        }
    }else if(!createNewNode){
        var dot = document.getElementById("pin-"+id);
        dot.setAttribute("fill", "blue");
        prevPointID = id;
        pointExists = true;
    }else{
        var line = document.getElementById(id);
        line.style.stroke =  "blue";
        if(selectComp){
            deselect(selectID, "Component");
        }
        if(selectNode){
            deselect(selectID, "Node");
        }
        selectLine = true;
        selectID = id;
    }
}    

//Deselect component or line
function deselect(id, type){
    switch(type){
        case "Line":
            var line = document.getElementById(id);
            line.style.stroke =  "black";
            selectLine = false;
            break;
        case "Component":
            document.getElementById("img"+id).removeAttribute("opacity");
            selectComp = false;
            break;
        case "Node":
            var dot = document.getElementById("pin-"+id);
            dot.setAttribute("fill", "black");
            pointExists = false;
            selectNode = false;
            break;
    }
}

//Position class
function Position(x, y){
    this.x = x;
    this.y = y;
    this.show = function(){
        return this.x+" "+this.y;
    }
    this.coords = function(){
        return [this.x, this.y];
    }
    this.offset = function(x, y){
        var pos = new Position(this.x, this.y);
        pos.x+=x;
        pos.y+=y;
        return pos;
    }
}

//Create a node that connects 3 or more components
function createNode(lineID, pos){
    var lineIDs = lineID.split("_");
    var line1 = document.getElementById(lineID);
    var pin0 = document.getElementById("pin-"+lineIDs[0]);
    var pin1 = document.getElementById("pin-"+lineIDs[1]);
    var pos0 = new Position(pin0.cx.baseVal.value, pin0.cy.baseVal.value);
    var pos1 = new Position(pin1.cx.baseVal.value, pin1.cy.baseVal.value);
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
    svg.innerHTML+= drawPolyLine(lineID2, findPolyStr(pins, lineIDs[1], pinCount));
    svg.innerHTML+= drawNode(pinCount, pos);
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
    var dot0 = document.getElementById("pin-"+moveID);
    dot0.setAttribute("cx",cPos.x);
    dot0.setAttribute("cy",cPos.y);
    var lines1 = pins[moveID].lines;
    pins[moveID].pos = cPos;
    for(var i=0; i<lines1.length; i++){
        var line = document.getElementById(lines[lines1[i]]);
        var lineID = lines[lines1[i]].split("_");
        line.setAttribute("points", findPolyStr(pins, lineID[0],lineID[1]));
    }
}

//Move component
function moveComponent(pos){
    pos = pos.offset(-pos.x%gridSize, -pos.y%gridSize);
    var halfImgSize = imgSize/2;
    var adjustedPos = pos.offset(-halfImgSize, -imgSize);
    var leftPos = pos.offset(-halfImgSize, -halfImgSize);
    var rightPos = pos.offset(halfImgSize, -halfImgSize);
    var topPos = pos.offset(0, -imgSize);
    var cPos = pos.offset(0, -halfImgSize);
    var bottomPos = pos;
    var pos0, pos1, pos2;
    var comp = components[moveID];

    if(comp.direction[0]===0){
        if(comp.direction[1]===1){
            pos0 = topPos;
            pos1 = bottomPos;
        }else{
            pos0 = bottomPos;
            pos1 = topPos;
        }
        pos2 = rightPos.offset(8, 5);
    }else if(comp.direction[1]===0){
        if(comp.direction[0]===1){
            pos0 = leftPos;
            pos1 = rightPos;
        }else{
            pos0 = rightPos;
            pos1 = leftPos;
        }    
        pos2 = bottomPos;
    }
    
    var dot0 = document.getElementById("pin-"+ comp.pins[0]);
    var dot1 = document.getElementById("pin-" + comp.pins[1]);
    dot0.setAttribute("cx",pos0.x);
    dot0.setAttribute("cy",pos0.y);
    dot1.setAttribute("cx", pos1.x);
    dot1.setAttribute("cy", pos1.y);
    var text = document.getElementById("txt"+moveID);
    text.setAttribute('x',pos2.x); text.setAttribute('y', pos2.y);
    var img = document.getElementById("img"+moveID);
    img.setAttribute("x", adjustedPos.x); img.setAttribute("y", adjustedPos.y);
    var angle = getAngleFromDirection(comp.direction);
    img.setAttribute("transform", 'rotate('+angle+' '+cPos.coords()+')');

    var lines1 = pins[comp.pins[0]].lines;
    var lines2 = pins[comp.pins[1]].lines;
    pins[comp.pins[0]].pos = pos0;
    pins[comp.pins[1]].pos = pos1;
    comp.pos = cPos;
    for(var i=0; i<lines1.length; i++){
        if(lines[lines1[i]]!==""){
            var line = document.getElementById(lines[lines1[i]]);
            var pins1 = lines[lines1[i]].split("_");
            line.setAttribute("points", findPolyStr(pins, pins1[0], pins1[1]));
        }else{
            lines1.splice(i, 1);
            if(i>0){i--;}
        }
    }
    for(var i=0; i<lines2.length; i++){
        if(lines[lines2[i]]!==""){
            var line = document.getElementById(lines[lines2[i]]);
            var pins2 = lines[lines2[i]].split("_");
            line.setAttribute("points", findPolyStr(pins, pins2[0], pins2[1]));
        }else{
            lines2.splice(i, 1);
            if(i>0){i--;}
        }
    }
}


//Rotate a component
function rotateComponent(id){
    var comp = components[id];
    var pos = comp.pos;
    
    var halfImgSize = imgSize/2;
    var leftPos = pos.offset(-halfImgSize, 0);
    var rightPos = pos.offset(halfImgSize, 0);
    var topPos = pos.offset(0, -halfImgSize);
    var bottomPos = pos.offset(0, halfImgSize);
    var pos0, pos1, pos2;
    var dir1, dir2;


    if(comp.direction[0]===0){
        comp.direction = [comp.direction[1], 0];
    }else if(comp.direction[1]===0){
        comp.direction = [0, -comp.direction[0]];
    }

    dir2 = comp.direction;

    if(comp.direction[0]===0){
        if(comp.direction[1]===1){
            pos0 = topPos;
            pos1 = bottomPos;
        }else{
            pos0 = bottomPos;
            pos1 = topPos;
        }
        pos2 = rightPos.offset(8, 5);
        dir1 = [0,-comp.direction[1]];
    }else if(comp.direction[1]===0){
        if(comp.direction[0]===1){
            pos0 = leftPos;
            pos1 = rightPos;
        }else{
            pos0 = rightPos;
            pos1 = leftPos;
        }    
        pos2 = bottomPos;
        dir1 = [-comp.direction[0],0];
    }
    var pinId0 = comp.pins[0];
    var pinId1 = comp.pins[1];
    var dot0 = document.getElementById("pin-" + pinId0);
    var dot1 = document.getElementById("pin-" + pinId1);
    dot0.setAttribute("cx", pos0.x);
    dot0.setAttribute("cy", pos0.y);
    dot1.setAttribute("cx", pos1.x);
    dot1.setAttribute("cy", pos1.y);
    var text = document.getElementById("txt"+id);
    text.setAttribute('x',pos2.x); text.setAttribute('y', pos2.y);
    var img = document.getElementById("img"+id);
    var angle = getAngleFromDirection(comp.direction);
    img.setAttribute("transform", 'rotate('+angle+' '+pos.coords()+')');
    var lines1 = pins[pinId0].lines;
    var lines2 = pins[pinId1].lines;
    pins[pinId0].pos = pos0;
    pins[pinId1].pos = pos1;
    pins[pinId0].direction = dir1;
    pins[pinId1].direction = dir2;
    for(var i=0; i<lines1.length; i++){
        var line = document.getElementById(lines[lines1[i]]);
        var pins1 = lines[lines1[i]].split("_");
        line.setAttribute("points", findPolyStr(pins, pins1[0], pins1[1]));
    }
    for(var i=0; i<lines2.length; i++){
        var line = document.getElementById(lines[lines2[i]]);
        var pins2 = lines[lines2[i]].split("_");
        line.setAttribute("points", findPolyStr(pins, pins2[0], pins2[1]));
    }
}

function getAngleFromDirection(direction){
    var angle = 0;
    switch(direction[0]*2 + direction[1]){
        case 0*2 + 1: angle = 90; break;
        case 0*2 - 1: angle = -90; break;
        case 1*2 + 0: angle = 0; break;
        case -1*2+0: angle = 180; break;
    }
    return angle;
}

function deleteComponent(selectId){
    var svg = document.getElementById("svg"); 
    var comp = components[selectID];
    svg.removeChild(document.getElementById("pin-"+comp.pins[0]));
    svg.removeChild(document.getElementById("pin-"+comp.pins[1]));
    svg.removeChild(document.getElementById("img"+selectID));
    svg.removeChild(document.getElementById("txt"+selectID));
    deleteLines(pins[comp.pins[0]]);
    deleteLines(pins[comp.pins[1]]);
    components[selectID] = {};
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
    var svg = document.getElementById("svg");
    svg.removeChild(document.getElementById(lines[lineIndex]));
    var linePins = lines[lineIndex].split("_");
    lines[lineIndex] = "";
    pins[linePins[0]].lines.splice(pins[linePins[0]].lines.indexOf(lineIndex), 1);
    pins[linePins[1]].lines.splice(pins[linePins[1]].lines.indexOf(lineIndex), 1);
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

//Select component
function selectComponent(id){
    var image = document.getElementById("img"+id);
    image.setAttribute("opacity", "0.7");
    selectComp = true;
    selectID = id;
}

//Drag component
svg.addEventListener("mousemove", function(){
    var pos = new Position(window.event.clientX, window.event.clientY);
    if(moveComp){
        moveComponent(pos);
    }else if(moveDot){
        moveNode(pos);
    }
});

//Add component
svg.addEventListener("click", function(){
    var pos = new Position(window.event.clientX, window.event.clientY).offset(-10, -30);
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
                if(selectComp){ 
                    document.getElementById("img"+selectID).removeAttribute("opacity");
                }
                if(!selectComp || selectID!==i){
                    selectComponent(i);
                }else{
                    selectComp = false;
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
            var prevDot = document.getElementById("pin-"+prevPointID);
            prevDot.setAttribute("fill", "black");
            pointExists = false;
        }else if(selectComp){
            deselect(selectID, "Component");
        }else if(newCompType!==""){
            svg.innerHTML+= addComponent(newCompType, pos);
        }
    }
});

//Detect keys to rotate and delete components
document.addEventListener("keydown", function (event){
    var key = event.keyCode ? event.keyCode : event.which;
    var svg = document.getElementById("svg");
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
            deleteLine(lines.indexOf(selectID));
            selectLine = false;
        }
    }
});
