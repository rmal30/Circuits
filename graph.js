function Graph(){
    this.nodes = {};
    this.edges = {};
    this.nodeCount = function(){
        return Object.keys(this.nodes).length;
    }

    this.addNode = function(id){
        this.nodes[id] = [];
    }

    this.addEdge = function(id, nodeIds){
        this.edges[id] = nodeIds;
        this.nodes[nodeIds[0]].push(id);
        this.nodes[nodeIds[1]].push(id);
    }

    this.removeEdge = function(id, nodeIds){
        unset(this.nodes[nodeIds[0]], id);
        unset(this.nodes[nodeIds[1]], id);
        delete this.edges[id];
    }

    this.neighbours = function(nodeId){
        var neighbours = [];
        var edgeId;
        var nodeId2;
        if(this.nodes[nodeId]!=undefined){
            for(var i=0; i<this.nodes[nodeId].length; i++){
                edgeId = this.nodes[nodeId][i];
                if(this.edges[edgeId][0] == nodeId){
                    nodeId2 = this.edges[edgeId][1];
                }else{
                    nodeId2 = this.edges[edgeId][0];
                }
                neighbours.push(nodeId2);
            }
        }
        return neighbours;
    }

    this.getEdge = function(nodeId1, nodeId2){
        var edges = this.nodes[nodeId1];
        var edge;
        for(var i=0; i<edges.length; i++){
            edge = this.edges[edges[i]];
            if(edge[0] == nodeId2 || edge[1] == nodeId2){
                return edges[i];
            }
        }
    }
}

function unset(arr, value) {
    if(arr.indexOf(value) != -1) { // Make sure the value exists
        arr.splice(arr.indexOf(value), 1);
    }   
}

function generateGraph(pins, lines, components){
    var graph = new Graph();
    for(var i=0; i<pins.length; i++){
        if(Object.keys(pins[i]).length > 0){
            graph.addNode(i);
        }
    }
    
    var edge;
    for(var i=0; i<lines.length; i++){
        if(lines[i]!=""){
            edge = lines[i].split("_");
            graph.addEdge("lin-" + i, [parseInt(edge[0]), parseInt(edge[1])]);
       } 
    }

    for(var i=0; i<components.length; i++){
        if(Object.keys(components[i]).length>0){
            edge = components[i];   
            graph.addEdge(edge.type + "-" + edge.id, edge.pins);
        }
    }
    return graph;
}

function spanningTree(graph){
    var tree = new Graph();
    for(var nodeId in graph.nodes){
        tree.addNode(nodeId);
        break;
    }
    var edge, nodeId2;
    var edgeFound;
    var edgeId;
    var counter = 0;
    while(tree.nodeCount() < graph.nodeCount() && counter < 1000){
        edgeFound = false;
        for(var nodeId in tree.nodes){
            for(var i=0; i<graph.nodes[nodeId].length; i++){
                edgeId = graph.nodes[nodeId][i];
                edge = graph.edges[edgeId];
                if(edge[0] == nodeId){
                    nodeId2 = edge[1]; 
                }else{
                    nodeId2 = edge[0];
                }
                if(tree.nodes[nodeId2] == undefined){
                    tree.addNode(nodeId2);
                    tree.addEdge(edgeId, [parseInt(nodeId), nodeId2]);
                    edgeFound = true;
                    break;
                }
            }
            if(edgeFound){
                break;
            }
        }
        counter++;
    }
    return tree;
}


function getCycleBasis(graph){
    var tree = spanningTree(graph);
    var cycles = [];
    var edges = {};
    var edge, edgeId;
    for(var nodeId in graph.nodes){
        for(var i=0; i<graph.nodes[nodeId].length; i++){
            edgeId = graph.nodes[nodeId][i];
            if(tree.edges[edgeId] == undefined){
                edges[edgeId] = graph.edges[edgeId];
            }
        }
    }
    var cycle; 
    for(var edgeId in edges){
        edge = edges[edgeId];
        //tree.addEdge(edgeId, edge);
        cycle = findCycle(tree, edge);
        if(cycle!=undefined){
            cycles.push(cycle);
        }
        //tree.removeEdge(edgeId, edge);
    }
    return cycles;
}

function findCycle(graph, edge){
    var nodeId1 = edge[0];
    var nodeId2 = edge[1];
    var cycle = findPath(graph, nodeId2, nodeId1);
    return cycle;
}

function findPath(graph, nodeId1, nodeId2){
    var stack = [];
    var neighbours;
    var ancestors = {};

    stack.push(nodeId1);
    
    var visited = {};
    for(var id in graph.nodes){
        visited[id] = false;
    }
    
    while(stack.length>0){
        node = stack.pop();
        if(node == nodeId2){
            break;
        }

        if(!visited[node]){
            visited[node] = true;
            neighbours = graph.neighbours(node);
            for(var i=0; i<neighbours.length; i++){
                if(!visited[neighbours[i]]){
                    ancestors[neighbours[i]] = node;
                    stack.push(neighbours[i]);
                }
            }
        }
    }
    
    var nodePath = [node];
    while(ancestors[node] != undefined){
        node = ancestors[node];
        nodePath.push(node);
    }

    if(nodePath[nodePath.length-1] == nodeId1 && nodePath[0] == nodeId2){
        return nodePath;
    }else{
        return undefined;
    }
}
