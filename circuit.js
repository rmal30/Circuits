function getComponents(components, types){
    var found = [];
    for(var i = 0; i < components.length; i++){
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
        if(edgeID.includes("idc") || edgeID.includes("iac") || edgeID.includes("cs-")){
            graph.removeEdge(edgeID, graph.edges[edgeID]);
        }
    }
    var loops2 = getCycleBasis(graph);
    var currents = [];
    var diodes = getComponents(components, ["dio"]);
    for(var c = 0; c < (1 << diodes.length); c++){
        var states = [];
        for(var i = 0; i < diodes.length; i++){
            var state = (c & (1 << i)) !== 0;
            states.push(state);
            diodes[i].value = state;
        }
        var impComponents = getComponents(components, ["res", "cap", "ind", "dio"]);
        var init = voltageVector(loops2, components);
        var curMatrix = groupMatrix(loops, impComponents, "loop");
        var voltMatrix = lawMatrix(loops2, impComponents, "loop");
        var kvlMatrix = multiplyM(voltMatrix, curMatrix);
        var currentComponents = getComponents(components, ["idc", "iac"]);
        var curMatrix2 = groupMatrix(loops, currentComponents, "loop");
        kvlMatrix = kvlMatrix.concat(curMatrix2);

        var currentAmpComponents = getComponents(components, ["cccs"]);
        var currentAmpMatrix = groupMatrix2(loops, currentAmpComponents, "loop");
        for(var i = 0; i < currentAmpMatrix.length; i++){
            kvlMatrix.push(currentAmpMatrix[i]);
            init.push(0);
        }

        var loopCurrents = gaussianElimination(kvlMatrix, init);
        currents.push(multiplyM(curMatrix, transpose([loopCurrents])));
    }
    return currents;
}

function printComplex(z){
    var isArray = z.constructor === Array;
    if(isArray){
        return roundNum(z[0], 8) + " + " + roundNum(z[1], 8) + "j";
    }else{
        return roundNum(z, 8);
    }
}

function getVoltages(){
    var graph = generateGraph(pins, lines, components);
    var nodes = getNodeGroups(graph);
    var edge;
    var count = 0;
    for(var edgeID in graph.edges){
        if(edgeID.includes("vdc") || edgeID.includes("vac") || edgeID.includes("vs-")){
            edge = graph.edges[edgeID];
            graph.removeEdge(edgeID, edge);
            graph.addEdge("lin-" + (lines.length + count), edge);
            count++;
        }
    }
    var nodes2 = getNodeGroups(graph);
    nodes2.pop();

    var voltages = [];
    var diodes = getComponents(components, ["dio"]);
    for(var c = 0; c < (1 << diodes.length); c++){
        var states = [];
        for(var i = 0; i < diodes.length; i++){
            var state = (c & (1 << i)) !== 0;
            states.push(state);
            diodes[i].value = state;
        }
        var impComponents = getComponents(components, ["res", "cap", "ind", "dio"]);
        var init = currentVector(nodes2, components);
        var voltMatrix = groupMatrix(nodes, impComponents, "node");
        var curMatrix = lawMatrix(nodes2, impComponents, "node");
        var kclMatrix = multiplyM(curMatrix, voltMatrix);
        var voltageComponents = getComponents(components, ["vdc", "vac"]);
        var voltMatrix2 = groupMatrix(nodes, voltageComponents, "node");
        for(var i = 0; i < voltMatrix2.length; i++){
            kclMatrix.push(voltMatrix2[i]);
        }

        var voltageAmpComponents = getComponents(components, ["vcvs"]);
        var voltageAmpMatrix = groupMatrix2(nodes, voltageAmpComponents, "node");
        for(var i = 0; i < voltageAmpMatrix.length; i++){
            kclMatrix.push(voltageAmpMatrix[i]);
            init.push(0);
        }

        var groundNodes = [1];
        for(var i = 1; i < nodes.length; i++){
            groundNodes.push(0);
        }
        kclMatrix.push(groundNodes);
        var nodeVoltages = gaussianElimination(kclMatrix, init);
        voltages.push(scalarMultiply(multiplyM(voltMatrix, transpose([nodeVoltages])), -1));
    }

    return voltages;
}

function voltageVector(loops2, components){
    var voltageSum;
    var init = [];
    var voltageComponents = getComponents(components, ["vdc", "vac"]);
    var currentComponents = getComponents(components, ["idc", "iac"]);
    for(var i = 0; i < loops2.length; i++){
        voltageSum = 0;
        for(var j = 0; j < voltageComponents.length; j++){
            voltageSum -= direction(voltageComponents[j].pins, loops2[i], "loop") * voltageComponents[j].value;
        }
        init.push(voltageSum);
    }
    init = init.concat(currentComponents.map(component => -component.value));
    return init;
}

function currentVector(nodes2, components){
    var currentSum;
    var init = [];
    var voltageComponents = getComponents(components, ["vdc", "vac"]);
    var currentComponents = getComponents(components, ["idc", "iac"]);
    for(var i = 0; i < nodes2.length; i++){
        currentSum = 0;
        for(var j = 0; j < currentComponents.length; j++){
            currentSum -= direction(currentComponents[j].pins, nodes2[i], "node") * currentComponents[j].value;
        }
        init.push(currentSum);
    }
    init = init.concat(voltageComponents.map(component => -component.value));
    init.push(0);
    return init;
}

function lawMatrix(groups2, impComponents, type){
    var matrix = [];
    var compDirection;
    for(var i = 0; i < groups2.length; i++){
        matrix[i] = [];
        for(var k = 0; k < impComponents.length; k++){
            compDirection = direction(impComponents[k].pins, groups2[i], type);
            if(type === "loop"){
                matrix[i][k] = multiplyC(compDirection, impedance(impComponents[k]));
            }else if(type === "node"){
                matrix[i][k] = divideC(compDirection, impedance(impComponents[k]));
            }
        }
    }
    return matrix;
}

function impedance(component){
    var value = component.value;
    var freq = hertz * Math.PI * 2;
    switch(component.type){
        case "res": return parseFloat(value);
        case "cap": return [0, -Math.pow(10, 6) / (value * freq)];
        case "ind": return [0, Math.pow(10, -3) * value * freq];
        case "dio": return value ? 1e-100 : Infinity;
        default: return 0;
    }
}

function groupMatrix(groups, impComponents, type){
    var compMatrix = [];
    for(var j = 0; j < impComponents.length; j++){
        compMatrix[j] = [];
        for(var k = 0; k < groups.length; k++){
            compMatrix[j].push(direction(impComponents[j].pins, groups[k], type));
        }
    }
    return compMatrix;
}

function groupMatrix2(groups, impComponents, type){
    var compMatrix = [];
    for(var j = 0; j < impComponents.length; j++){
        compMatrix[j] = [];
        var componentPins = impComponents[j].pins;
        var dir = (type === "loop") ? -1 : 1;
        for(var k = 0; k < groups.length; k++){
            compMatrix[j].push(
                impComponents[j].value * direction([componentPins[0], componentPins[2]], groups[k], type) -
                dir * direction([componentPins[1], componentPins[3]], groups[k], type)
            );
        }
    }
    return compMatrix;
}

function direction(pins, group, type){
    if(type === "loop"){
        return loopDirection(pins, group);
    }else{
        return nodeDirection(pins, group);
    }
}

function loopDirection(pins, loop){
    var pin1 = loop.indexOf(pins[0]);
    var pin2 = loop.indexOf(pins[1]);
    if(pin2 === -1 || pin1 === -1){
        return 0;
    }else if(pin2 - pin1 === 1 || (pin1 === loop.length - 1 && pin2 === 0)){
        return 1;
    }else if(pin1 - pin2 === 1 || (pin1 === 0 && pin2 === loop.length - 1)){
        return -1;
    }else{
        return 0;
    }
}

function nodeDirection(pins, node){
    var pin1 = node.indexOf(pins[0]);
    var pin2 = node.indexOf(pins[1]);

    if(pin1 !== -1 && pin2 === -1){
        return -1;
    }else if(pin2 !== -1 && pin1 === -1){
        return 1;
    }else{
        return 0;
    }
}
