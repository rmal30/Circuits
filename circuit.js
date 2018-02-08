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
    var impComponents = getComponents(components, ["res", "cap", "ind"]);
    var sourceComponents = getComponents(components, ["vdc"]);
    var initVoltage = sourceVoltage(loops, sourceComponents);
    var voltMatrix = KVLMatrix(loops, impComponents);
    var curMatrix = loopMatrix(loops, impComponents);
    console.log(initVoltage, voltMatrix, curMatrix);
    var loopCurrents = solveKVL(voltMatrix, curMatrix, initVoltage);
    console.log(loopCurrents);
}

function solveKVL(voltMatrix, curMatrix, initVoltage){
    var matrix = multiply(voltMatrix, curMatrix);
    return QRSolve(matrix, initVoltage);
}

function sourceVoltage(loops, sourceComponents){
    var voltageSum;
    var initVoltage = [];
    for(var i=0; i<loops.length; i++){
        voltageSum = 0;
        for(var j=0; j<sourceComponents.length; j++){
            voltageSum -= direction(sourceComponents[j], loops[i]) * sourceComponents[j].value;
        }
        initVoltage.push(voltageSum);
    }
    return initVoltage;
}

function KVLMatrix(loops, impComponents){
    var voltMatrix = [];
    for(var i=0; i<loops.length; i++){
        voltMatrix[i] = [];
        for(var k=0; k<impComponents.length; k++){			
	    voltMatrix[i][k] = direction(impComponents[k], loops[i]) * impComponents[k].value; 
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
    var dist = ((pin2 - pin1) + loop.length) % loop.length;
    if(pin2 == -1 || pin1 == -1){
        return 0;
    }else if(dist === 1) {
        return 1;
    }else{
        return -1;
    }
}
