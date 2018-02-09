function getComponents(components, types){
    var found = [];
    for(var i=0; i<components.length; i++){
        if(types.indexOf(components[i].type) !== -1){
            found.push(components[i]);
        }
    }
    return found;
}

function getCurrents(){
    var graph = generateGraph(pins, lines, components);
    var loops = getCycleBasis(graph);
    for(var edgeID in graph.edges){
        if(edgeID.includes("idc")){
            graph.removeEdge(edgeID, graph.edges[edgeID]);
        }
    }
    var loops2 = getCycleBasis(graph);
    var impComponents = getComponents(components, ["res", "cap", "ind"]);
    var init = sourceVector(loops2, components);
    var curMatrix = loopMatrix(loops, impComponents);
    var voltMatrix = KVLMatrix(loops2, impComponents);
    var kvlMatrix = multiply(voltMatrix, curMatrix);
    var currentComponents = getComponents(components, ["idc"]);
   
    var curMatrix2 = loopMatrix(loops, currentComponents);
    for(var i=0; i<curMatrix2.length; i++){
        kvlMatrix.push(curMatrix2[i]);
    }

    var loopCurrents = solveKVL(kvlMatrix, init);
    var componentCurrents = multiply(curMatrix, transpose([loopCurrents]));
    for(var i=0; i<impComponents.length; i++){
        console.log(JSON.stringify(impComponents[i]) + ": " + componentCurrents[i]);
    }
}

function solveKVL(matrix, init){
    return QRSolve(matrix, init);
}

function sourceVector(loops2, components){
    var voltageSum;
    var init = [];
    var voltageComponents = getComponents(components, ["vdc"]);
    var currentComponents = getComponents(components, ["idc"]);
    for(var i=0; i<loops2.length; i++){
        voltageSum = 0;
        for(var j=0; j<voltageComponents.length; j++){
            voltageSum -= direction(voltageComponents[j], loops2[i]) * voltageComponents[j].value;
        }
        init.push(voltageSum);
    }
    for(var i=0; i<currentComponents.length; i++){
        init.push(-currentComponents[i].value);
    }

    return init;
}

function KVLMatrix(loops2, impComponents){
    var voltMatrix = [];
    for(var i=0; i<loops2.length; i++){
        voltMatrix[i] = [];
        for(var k=0; k<impComponents.length; k++){			
	    voltMatrix[i][k] = direction(impComponents[k], loops2[i]) * impComponents[k].value; 
        }
    }
    return voltMatrix;
}

function loopMatrix(loops, impComponents){
    var currentMatrix = [];
    for(var j=0; j<impComponents.length; j++){
	currentMatrix[j] = [];
	for(var k=0; k<loops.length; k++){
            currentMatrix[j].push(direction(impComponents[j], loops[k]));
        }
    }
    return currentMatrix;
}

function direction(component, loop){
    var pin1 = loop.indexOf(component.pins[0]);
    var pin2 = loop.indexOf(component.pins[1]);
    if(pin2 == -1 || pin1 == -1){
        return 0;
    }else if(pin2 - pin1 === 1 || (pin1 ===loop.length - 1 && pin2 === 0)) {
        return 1;
    }else if(pin1 - pin2 === 1 || (pin1 === 0 && pin2 === loop.length - 1)) {
        return -1;
    }else{
        return 0;
    }
}
