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
}

function unset(arr, value) {
    if(arr.indexOf(value) != -1) { // Make sure the value exists
        arr.splice(arr.indexOf(value), 1);
    }   
}

function generateGraph(pins, lines, components){
    var graph = new Graph();
    for(var i=0; i<pins.length; i++){
        graph.addNode(i);
    }
    
    var edge;
    for(var i=0; i<lines.length; i++){
        edge = lines[i].split("_");
        graph.addEdge("lin-" + i, [parseInt(edge[0]), parseInt(edge[1])]);
    }

    for(var i=0; i<components.length; i++){
        edge = components[i];   
        graph.addEdge(edge.type + "-" + edge.id, edge.pins);
    }
    return graph;
}

function spanningTree(graph){
    var tree = new Graph();
    tree.addNode(0);
    var edge, nodeId2;
    var edgeFound;
    var edgeId;
    while(tree.nodeCount() < graph.nodeCount()){
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
                    tree.addEdge(edgeId, [nodeId, nodeId2]);
                    edgeFound = true;
                    break;
                }
            }
            if(edgeFound){
                break;
            }
        }
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
    
    for(var edgeId in edges){
        edge = edges[edgeId];
        tree.addEdge(edgeId, edge);
        cycles.push(findCycle(tree, edge[0]));
        tree.removeEdge(edgeId, edge);
    }
    return cycles;
}

function findCycle(graph, nodeId){
    console.log(nodeId);
    var stack = [[undefined,nodeId]];
    var visited = {};
    for(var node in graph.nodes){
        visited[node] = false;
    }
    visited[nodeId] = true;
    var origin, dest;
    var edge, edgeId;
    var cycle = [nodeId];
    while(stack.length>0){
        origin = stack.pop();
        for(var i=0; i<graph.nodes[origin[1]].length; i++){
            edgeId = graph.nodes[origin[1]][i];
            edge = graph.edges[edgeId];
            if(origin[0] == edgeId){
                continue;
            }

            if(edge[0] == origin[1]){
                dest = edge[1];
            }else{
                dest = edge[0];
            }
            if(visited[dest]){
                return cycle;    
            }else{
                stack.push([edgeId,dest]);
                cycle.push(dest);
                visited[dest] = true;
            }
        }
    }
}



