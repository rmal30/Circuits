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
    var init = voltageVector(loops2, components);
    var curMatrix = groupMatrix(loops, impComponents, "loop");
    var voltMatrix = KVLMatrix(loops2, impComponents);
    var kvlMatrix = multiply(voltMatrix, curMatrix);
    var currentComponents = getComponents(components, ["idc"]);
   
    var curMatrix2 = groupMatrix(loops, currentComponents, "loop");
    for(var i=0; i<curMatrix2.length; i++){
        kvlMatrix.push(curMatrix2[i]);
    }

    var loopCurrents = QRSolve(kvlMatrix, init);
    var componentCurrents = multiply(curMatrix, transpose([loopCurrents]));
    for(var i=0; i<impComponents.length; i++){
        console.log(JSON.stringify(impComponents[i]) + ": " + componentCurrents[i]);
    }
}


function getVoltages(){
    var graph = generateGraph(pins, lines, components);
    var nodes = getNodeGroups(graph);
    nodes.pop();
    var edge;
    var count = 0;
    for(var edgeID in graph.edges){
        if(edgeID.includes("vdc")){
            edge = graph.edges[edgeID];
            graph.removeEdge(edgeID, edge);
            graph.addEdge("lin-"+(100+count), edge);
            count++;
        }
    }
    var nodes2 = getNodeGroups(graph);
    nodes2.pop();
    var impComponents = getComponents(components, ["res", "cap", "ind"]);
    var init = currentVector(nodes2, components);
    var voltMatrix = groupMatrix(nodes, impComponents, "node");
    var curMatrix = KCLMatrix(nodes2, impComponents);
    var kclMatrix = multiply(curMatrix, voltMatrix);
    var voltageComponents = getComponents(components, ["vdc"]);
   
    var voltMatrix2 = groupMatrix(nodes, voltageComponents, "node");
    for(var i=0; i<voltMatrix2.length; i++){
        kclMatrix.push(voltMatrix2[i]);
    }

    var nodeVoltages = QRSolve(kclMatrix, init);
    var componentVoltages = multiply(voltMatrix, transpose([nodeVoltages]));
    for(var i=0; i<impComponents.length; i++){
        console.log(JSON.stringify(impComponents[i]) + ": " + componentVoltages[i]);
    }
}


function voltageVector(loops2, components){
    var voltageSum;
    var init = [];
    var voltageComponents = getComponents(components, ["vdc"]);
    var currentComponents = getComponents(components, ["idc"]);
    for(var i=0; i<loops2.length; i++){
        voltageSum = 0;
        for(var j=0; j<voltageComponents.length; j++){
            voltageSum -= direction(voltageComponents[j], loops2[i], "loop") * voltageComponents[j].value;
        }
        init.push(voltageSum);
    }
    for(var i=0; i<currentComponents.length; i++){
        init.push(-currentComponents[i].value);
    }

    return init;
}

function currentVector(nodes2, components){
    var currentSum;
    var init = [];
    var voltageComponents = getComponents(components, ["vdc"]);
    var currentComponents = getComponents(components, ["idc"]);
    for(var i=0; i<nodes2.length; i++){
        currentSum = 0;
        for(var j=0; j<currentComponents.length; j++){
            currentSum -= direction(currentComponents[j], nodes2[i], "node") * currentComponents[j].value;
        }
        init.push(currentSum);
    }
    for(var i=0; i<voltageComponents.length; i++){
        init.push(-voltageComponents[i].value);
    }
    return init;
}

function KVLMatrix(loops2, impComponents){
    var voltMatrix = [];
    for(var i=0; i<loops2.length; i++){
        voltMatrix[i] = [];
        for(var k=0; k<impComponents.length; k++){			
	    voltMatrix[i][k] = direction(impComponents[k], loops2[i], "loop") * impComponents[k].value; 
        }
    }
    return voltMatrix;
}

function KCLMatrix(nodes2, impComponents){
    var curMatrix = [];
    for(var i=0; i<nodes2.length; i++){
        curMatrix[i] = [];
        for(var k=0; k<impComponents.length; k++){
            curMatrix[i][k] = direction(impComponents[k], nodes2[i], "node")/impComponents[k].value;
        }
    }
    return curMatrix;
}

function groupMatrix(groups, impComponents, type){
    var compMatrix = [];
    for(var j=0; j<impComponents.length; j++){
	compMatrix[j] = [];
	for(var k=0; k<groups.length; k++){
            compMatrix[j].push(direction(impComponents[j], groups[k], type));
        }
    }
    return compMatrix;
}

function direction(component, group, type){
    if(type == "loop"){
        return loopDirection(component, group);
    }else{
        return nodeDirection(component, group);
    }
}

function loopDirection(component, loop){
    var pin1 = loop.indexOf(component.pins[0]);
    var pin2 = loop.indexOf(component.pins[1]);
    if(pin2 == -1 || pin1 == -1){
        return 0;
    }else if(pin2 - pin1 === 1 || (pin1 ===loop.length - 1 && pin2 === 0)){
        return 1;
    }else if(pin1 - pin2 === 1 || (pin1 === 0 && pin2 === loop.length - 1)){
        return -1;
    }else{
        return 0;
    }
}

function nodeDirection(component, node){
    var pin1 = node.indexOf(component.pins[0]);
    var pin2 = node.indexOf(component.pins[1]);

    if(pin1 != -1 && pin2 == -1){
        return -1;
    }else if(pin2 != -1 && pin1 == -1){
        return 1;
    }else{
        return 0;
    }
}
