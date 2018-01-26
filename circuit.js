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
var volt = {name:"Voltage source",init: "volt", prop:"Voltage", unit: "V"};
var voltAC = {name:"AC voltage source",init: "voltac", prop:"Phasor voltage",unit: "V"};
var cur = {name:"Current source",init: "cur", prop:"Current",unit: "A"};
var info = {res:res, cap:cap, ind:ind, volt:volt, voltac:voltAC, cur:cur};

function promptValue(info){
	var promptStr = "Please enter a "+ info.prop+" for a "+info.name+" in "+info.unit;
	var value = prompt(promptStr);
	while(value===""){
		alert("Please enter a valid value");
		value = prompt(promptStr);
	}
	return value;
}

function addComponent(type, pos){
		var compStr = "";
		var newCompInfo = info[type];
		var angle = 0;
		var direction = document.getElementById("newCompDir").value;
		if(direction==="V"){
			angle+=90;
		}
		var value = promptValue(newCompInfo);
		if(value!=null){
			pos = pos.offset(-pos.x%gridSize, -pos.y%gridSize);
			var adjustedPos = pos.offset(-imgSize/2, -imgSize);
			var leftPos = pos.offset(-24, -imgSize/2);
			var rightPos = pos.offset(24, -imgSize/2);
			var topPos = pos.offset(0, -imgSize);
			var cPos = pos.offset(0, -imgSize/2);
			var bottomPos = pos;
			var pos1, pos2, pos3;
			var id = components.length;
			var dir1, dir2;
			
			if(direction==="H"){
				pos1 = leftPos;
				pos2 = rightPos;
				pos3 = bottomPos;
				dir1 = [-1, 0];
				dir2 = [1, 0];
			}else{
				pos1 = topPos;
				pos2 = bottomPos;
				pos3 = rightPos.offset(8, 5);
				dir1 = [0,-1];
				dir2 = [0,1];
			}
			components.push({id:id, type:type, value:value, direction:dir2, pins:[pinCount, pinCount+1], pos: cPos});			
			compStr+='<image id="img'+id+'" xlink:href="images/'+newCompInfo.init+'.png'+'" x="'+adjustedPos.x+'" y="'+adjustedPos.y+'" height="'+imgSize+'" width="'+imgSize+'" onmousedown="move(\''+id+'\')" onmouseup="stopMove()" transform="rotate('+angle+" "+cPos.coords()+')"/>';
			compStr+='<text x="'+pos3.x+'" y="'+pos3.y+'" id="'+"txt"+id+'" text-anchor="middle" style="user-select:none;" onclick="updateValue(\''+id+'\')">'+value+" "+newCompInfo.unit+'</text>';
			compStr+='<circle id="pin-'+pinCount+'" cx="'+pos1.x+'" cy="'+pos1.y+'" r="'+dotSize+'" fill="black" onclick="drawLine(\''+pinCount+'\', false)"></circle>';
			compStr+='<circle id="pin-'+(pinCount+1)+'" cx="'+pos2.x+'" cy="'+pos2.y+'" r="'+dotSize+'" fill="black" onclick="drawLine(\''+(pinCount+1)+'\', false)"></circle>';
			pins[pinCount] = {pos: pos1, comp:id, lines:[], direction:dir1};
			pins[pinCount+1] = {pos: pos2, comp:id, lines:[], direction:dir2};
			pinCount+=2;
		}
		return compStr;
}

function handleNode(id){
	moveDot = true;
	selectNode = true;
	selectComp = false;
	moveID = id;
	selectID = id;
}

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
			drawPolyLine(prevPointID, id);
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
			deSelect(selectID, "Component");
		}
		if(selectNode){
			deSelect(selectID, "Node");
		}
		selectLine = true;
		selectID = id;
	}
}	

function deSelect(id, type){
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

function findPolyStr(pinId0, pinId1){
	var polyStr = "";
	var pin0 = pins[pinId0];
	var pin1 = pins[pinId1];
	var origin = pin0.pos;
	var dest = pin1.pos;
	var dir0 = pin0.direction;
	var dir1 = pin1.direction;
	var dx = dest.x - origin.x;
	var dy = dest.y - origin.y;
	var mid = origin.offset(dx*0.5, dy*0.5);
	var min = new Position(Math.min(origin.x, dest.x), Math.min(origin.y, dest.y));
	var max = new Position(Math.max(origin.x, dest.x), Math.max(origin.y, dest.y));
	var polyLinePoints = [];
	var midPoints = [];
	var halfImgSize = imgSize/2;
	if(!dir0){ dir0 = [dx*Math.abs(dir1[1]),dy*Math.abs(dir1[0])];}
	if(!dir1){ dir1 = [-dx*Math.abs(dir0[1]),-dy*Math.abs(dir0[0])];}
	var kx = dx*dir0[0]>0 && dx*dir1[0]<0;
	var sx = dir1[0]*dir0[0]>0;
	if(dir0 && dir1){	
		if(dir0[1]===0 && dir1[1]===0){
			if(sx){
				if(Math.abs(dy)>halfImgSize){
					if(dir1[0]<0){
						midPoints.push([min.x-halfImgSize, origin.y]);
						midPoints.push([min.x-halfImgSize, dest.y]);
					}else{
						midPoints.push([max.x+halfImgSize, origin.y]);
						midPoints.push([max.x+halfImgSize, dest.y]);
					}
				}else if(Math.abs(dy)<imgSize){
					midPoints.push([origin.x+dir0[0]*halfImgSize, origin.y]);
					if(dy*dx*dir1[0]>=0){
						midPoints.push([origin.x+dir0[0]*halfImgSize, max.y - halfImgSize]);
						midPoints.push([dest.x+dir1[0]*halfImgSize, max.y - halfImgSize]);	
					}else{
						midPoints.push([origin.x+dir0[0]*halfImgSize, min.y + halfImgSize]);
						midPoints.push([dest.x+dir1[0]*halfImgSize, min.y + halfImgSize]);
					}
					midPoints.push([dest.x+dir1[0]*halfImgSize, dest.y]);	
				}else{
					midPoints.push([mid.x, origin.y]);
					midPoints.push([mid.x, dest.y]);
				}
			}else{
				if(dx*dir0[0]>=0 && (Math.abs(dx)>imgSize || Math.abs(dy)<imgSize)){
					midPoints.push([mid.x, origin.y]);
					midPoints.push([mid.x, dest.y]);
				}else{
					midPoints.push([origin.x+dir0[0]*halfImgSize, origin.y]);
					if(Math.abs(dy)>=imgSize){
						midPoints.push([origin.x+dir0[0]*halfImgSize, mid.y]);
						midPoints.push([dest.x+dir1[0]*halfImgSize, mid.y]);
					}else{
						midPoints.push([origin.x+dir0[0]*halfImgSize, min.y - halfImgSize]);
						midPoints.push([dest.x+dir1[0]*halfImgSize, min.y - halfImgSize]);
					}
					midPoints.push([dest.x+dir1[0]*halfImgSize, dest.y]);
				} 
			}
		}else if(dir0[0]===0 && dir1[0]===0){
			if(dy*dir0[1]>0 && dy*dir1[1]<0 && Math.abs(dy)>imgSize){
				midPoints.push([origin.x, mid.y]);
				midPoints.push([dest.x, mid.y]);
			}else if(dir1[1]*dir0[1]>0 && Math.abs(dx)>halfImgSize){
				if(dir1[1]<0){
					midPoints.push([origin.x, min.y-imgSize]);
					midPoints.push([dest.x, min.y-imgSize]);
				}else{
					midPoints.push([origin.x,max.y+imgSize]);
					midPoints.push([dest.x, max.y+imgSize]);
				}
			}else if(Math.abs(dx)>imgSize){
				midPoints.push([origin.x, origin.y+dir0[1]*halfImgSize]);
				midPoints.push([mid.x, origin.y+dir0[1]*halfImgSize]);
				midPoints.push([mid.x, dest.y+dir1[1]*halfImgSize]);
				midPoints.push([dest.x, dest.y+dir1[1]*halfImgSize]);
			}else if(dy*dir0[1]<0 || dy*dir1[1]>0){
				midPoints.push([origin.x, origin.y+dir0[1]*halfImgSize]);
				if(dir1[1]*dir0[1]>0){
					if(dx*dy*dir1[1]>=0){
						midPoints.push([max.x - halfImgSize,origin.y+dir0[1]*halfImgSize]);
						midPoints.push([max.x - halfImgSize,dest.y+dir1[1]*halfImgSize]);	
					}else{
						midPoints.push([min.x + halfImgSize,origin.y+dir0[1]*halfImgSize]);
						midPoints.push([min.x + halfImgSize,dest.y+dir0[1]*halfImgSize]);
					}
				}else{
					midPoints.push([min.x - halfImgSize, origin.y + dir0[1]*halfImgSize]);
					midPoints.push([min.x - halfImgSize, dest.y + dir1[1]*halfImgSize]);
				}
				midPoints.push([dest.x, dest.y+dir1[1]*halfImgSize]);	
			}else{
				midPoints.push([origin.x, mid.y]);
				midPoints.push([dest.x, mid.y]);
			}
		}else if(dir0[0]===0 && dir1[1]===0){
			if(dy*dir0[1]>0 && dx*dir1[0]<0){
				midPoints.push([origin.x, dest.y]);
			}else{
				midPoints.push([dest.x, origin.y]);
			}
		}else{
			if(dx*dir0[0]>0 && dy*dir1[1]<0){
				midPoints.push([dest.x, origin.y]);
			}else{					
				midPoints.push([origin.x, dest.y]);
			}
		}
	}

	polyLinePoints.push(origin.coords());
	polyLinePoints = polyLinePoints.concat(midPoints);
	polyLinePoints.push(dest.coords());
	for(var i=0; i<polyLinePoints.length; i++){
		polyStr+=polyLinePoints[i][0]+","+polyLinePoints[i][1]+" ";
	}
	return polyStr;
}

function drawPolyLine(id1, id2){
	var lineID = id1+'_'+id2;
	if(lines.indexOf(lineID)===-1){
		var polyStr = findPolyStr(id1, id2);
		lines.push(lineID);
		pins[id1].lines.push(lines.length-1);
		pins[id2].lines.push(lines.length-1);
		svg.innerHTML+='<polyline id="'+lineID+'" points="'+polyStr+'" style="fill:none;stroke:black;stroke-width:2" onclick="drawLine(\''+lineID+'\', true)"/>';
	}	
}
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

function createNode(lineID, pos){
	var lineIDs = lineID.split("_");
	var line1= document.getElementById(lineID);
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
	line1.setAttribute("points", findPolyStr(lineIDs[0], pinCount));
	svg.innerHTML+='<polyline id="'+lineID2+'" points="'+findPolyStr(lineIDs[1], pinCount)+'" style="fill:none;stroke:black;stroke-width:2" onclick="drawLine(\''+lineID2+'\', true)"/>';	
	svg.innerHTML+='<circle id="pin-'+pinCount+'" cx="'+pos.x+'" cy="'+pos.y+'" r="'+4+'" fill="black" onmousedown="handleNode(\''+pinCount+'\')" onmouseup="stopMove()"></circle>';
	
	pinCount++;
	return (pinCount-1);
}

function move(id){
	moveComp = true;
	moveID = id;
}
function stopMove(){
	
	moveComp = false;
	if(moveDot){
		drawLine(moveID, false);
	}
	moveDot = false;
}

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
		line.setAttribute("points", findPolyStr(lineID[0],lineID[1]));
	}
}

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
	if(comp.direction[0]===0){
		img.setAttribute("transform", 'rotate('+90+' '+cPos.coords()+')');
	}

	var lines1 = pins[comp.pins[0]].lines;
	var lines2 = pins[comp.pins[1]].lines;
	pins[comp.pins[0]].pos = pos0;
	pins[comp.pins[1]].pos = pos1;
	comp.pos = cPos;
	for(var i=0; i<lines1.length; i++){
		if(lines[lines1[i]]!==""){
			var line = document.getElementById(lines[lines1[i]]);
			var pins1 = lines[lines1[i]].split("_");
			line.setAttribute("points", findPolyStr(pins1[0], pins1[1]));
		}else{
			lines1.splice(i, 1);
			if(i>0){i--;}
		}
	}
	for(var i=0; i<lines2.length; i++){
		if(lines[lines2[i]]!==""){
			var line = document.getElementById(lines[lines2[i]]);
			var pins2 = lines[lines2[i]].split("_");
			line.setAttribute("points", findPolyStr(pins2[0], pins2[1]));
		}else{
			lines2.splice(i, 1);
			if(i>0){i--;}
		}
	}
}

function rotate(id){
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
	dot0.setAttribute("cx",pos0.x);
	dot0.setAttribute("cy",pos0.y);
	dot1.setAttribute("cx", pos1.x);
	dot1.setAttribute("cy", pos1.y);
	var text = document.getElementById("txt"+id);
	text.setAttribute('x',pos2.x); text.setAttribute('y', pos2.y);
	var img = document.getElementById("img"+id);
	if(comp.direction[0]===0){
		img.setAttribute("transform", 'rotate('+90+' '+pos.coords()+')');
	}else{
		img.removeAttribute("transform");
	}

	var lines1 = pins[pinId0].lines;
	var lines2 = pins[pinId1].lines;
	pins[pinId0].pos = pos0;
	pins[pinId1].pos = pos1;
	pins[pinId0].direction = dir1;
	pins[pinId1].direction = dir2;
	for(var i=0; i<lines1.length; i++){
		var line = document.getElementById(lines[lines1[i]]);
		var pins1 = lines[lines1[i]].split("_");
		line.setAttribute("points", findPolyStr(pins1[0], pins1[1]));
	}
	for(var i=0; i<lines2.length; i++){
		var line = document.getElementById(lines[lines2[i]]);
		var pins2 = lines[lines2[i]].split("_");
		line.setAttribute("points", findPolyStr(pins2[0], pins2[1]));
	}
}


function updateValue(id){
	var compInfo = info[components[id].type];
	var value = promptValue(compInfo);
	if(value!=null){
		components[id].value = value;
		document.getElementById("txt"+id).innerHTML = value+" "+compInfo.unit;
	}
}

function selectComponent(id){
	var image = document.getElementById("img"+id);
	image.setAttribute("opacity", "0.7");
	selectComp = true;
	selectID = id;
}

svg.addEventListener("mousemove", function(){
	var pos = new Position(window.event.clientX,window.event.clientY);
	if(moveComp){
		moveComponent(pos);
	}else if(moveDot){
		moveNode(pos);
	}
});

svg.addEventListener("click", function(){
	var pos = new Position(window.event.clientX-10,window.event.clientY-30);
	var listen = true;
	var image;
	var pin;
	moveComp = false;
	moveDot = false;
	/*
	if(selectLine){
		deSelect(selectID, "Line");
	}
	*/
	for(var i=0; i<components.length; i++){
		if(Object.keys(components[i]).length>0){
			image = document.getElementById("img"+i);
			if(Math.abs(pos.x - image.x.baseVal.value)<imgSize*0.8 && Math.abs(pos.y - image.y.baseVal.value)<imgSize*0.8){
				listen = false;
				if(!selectComp || selectID!==i){
					if(selectComp){
						document.getElementById("img"+selectID).removeAttribute("opacity");
					}
					selectComponent(i);
				}else{
					document.getElementById("img"+selectID).removeAttribute("opacity");
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
			deSelect(selectID, "Component");
		}else if(newCompType!==""){
			svg.innerHTML+= addComponent(newCompType, pos);
		}
	}
});

document.addEventListener("keydown", function (event){
	var key = event.keyCode ? event.keyCode : event.which;
	if(selectNode){
		if(key === 46){
			var svg = document.getElementById("svg");
			svg.removeChild(document.getElementById("pin-"+selectID));
			var pin = pins[selectID];
			var lineIndex;
			var linePins;
			while(pin.lines.length>0){
				lineIndex = pin.lines[0];
				svg.removeChild(document.getElementById(lines[lineIndex]));
				linePins = lines[lineIndex].split("_");
				lines[lineIndex] = "";
				pins[linePins[0]].lines.splice(pins[linePins[0]].lines.indexOf(lineIndex), 1);
				pins[linePins[1]].lines.splice(pins[linePins[1]].lines.indexOf(lineIndex), 1);
			}
			pins[selectID] = {};
			selectNode = false;
			pointExists = false;
		}
	}
	if(selectComp){
		
		console.log(key);
		if (key === 82){
			rotate(selectID);
		}else if(key === 46){
			var comp = components[selectID];
			var svg = document.getElementById("svg");
			svg.removeChild(document.getElementById("pin-"+comp.pins[0]));
			svg.removeChild(document.getElementById("pin-"+comp.pins[1]));
			svg.removeChild(document.getElementById("img"+selectID));
			svg.removeChild(document.getElementById("txt"+selectID));
			console.log(comp.pins[0], pins);
			var pin0 = pins[comp.pins[0]];
			var pin1 = pins[comp.pins[1]];
			var lineIndex, line;
			var linePins;
			while(pin0.lines.length>0){
				lineIndex = pin0.lines[0];
				svg.removeChild(document.getElementById(lines[lineIndex]));
				linePins = lines[lineIndex].split("_");
				lines[lineIndex] = "";
				pins[linePins[0]].lines.splice(pins[linePins[0]].lines.indexOf(lineIndex), 1);
				pins[linePins[1]].lines.splice(pins[linePins[1]].lines.indexOf(lineIndex), 1);
			}
			while(pin1.lines.length>0){
				lineIndex = pin1.lines[0];
				svg.removeChild(document.getElementById(lines[lineIndex]));
				linePins = lines[lineIndex].split("_");
				lines[lineIndex] = "";
				pins[linePins[0]].lines.splice(pins[linePins[0]].lines.indexOf(lineIndex), 1);
				pins[linePins[1]].lines.splice(pins[linePins[1]].lines.indexOf(lineIndex), 1);
			}
			pins[comp.pins[0]] = {};
			pins[comp.pins[1]] = {};
			components[selectID] = {};
			selectComp = false;
		}
	}

	if(selectLine){
		if(key === 46){
			var svg = document.getElementById("svg");
			svg.removeChild(document.getElementById(selectID));
			var lineIndex = lines.indexOf(selectID);
			var linePins = selectID.split("_");
			lines[lineIndex] = "";
			pins[linePins[0]].lines.splice(pins[linePins[0]].lines.indexOf(lineIndex), 1);
			pins[linePins[1]].lines.splice(pins[linePins[1]].lines.indexOf(lineIndex), 1);
			selectLine = false;
		}
	}
});
