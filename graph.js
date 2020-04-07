function Graph(){
    this.nodes = {};
    this.edges = {};
    this.nodeCount = function(){
        return Object.keys(this.nodes).length;
    };

    this.addNode = function(id){
        this.nodes[id] = [];
    };

    this.addEdge = function(id, nodeIds){
        this.edges[id] = nodeIds;
        this.nodes[nodeIds[0]].push(id);
        this.nodes[nodeIds[1]].push(id);
    };

    this.removeEdge = function(id, nodeIds){
        unset(this.nodes[nodeIds[0]], id);
        unset(this.nodes[nodeIds[1]], id);
        delete this.edges[id];
    };

    this.neighbours = function(nodeId){
        var neighbours = [];
        var edgeId;
        var nodeId2;
        if(this.nodes[nodeId] !== undefined){
            for(var i = 0; i < this.nodes[nodeId].length; i++){
                edgeId = this.nodes[nodeId][i];
                if(this.edges[edgeId][0] === parseInt(nodeId)){
                    nodeId2 = this.edges[edgeId][1];
                }else{
                    nodeId2 = this.edges[edgeId][0];
                }
                neighbours.push(nodeId2);
            }
        }
        return neighbours;
    };

    this.getEdge = function(nodeId1, nodeId2){
        var edges = this.nodes[nodeId1];
        var edge;
        for(var i = 0; i < edges.length; i++){
            edge = this.edges[edges[i]];
            if(edge[0] === parseInt(nodeId2) || edge[1] === parseInt(nodeId2)){
                return edges[i];
            }
        }
    };
}

function unset(arr, value){
    if(arr.indexOf(value) !== -1){
        arr.splice(arr.indexOf(value), 1);
    }
}

function generateGraph(pins, lines, components){
    var graph = new Graph();
    for(var i = 0; i < pins.length; i++){
        if(Object.keys(pins[i]).length > 0){
            graph.addNode(i);
        }
    }

    var edge;
    for(var i = 0; i < lines.length; i++){
        if(lines[i]){
            edge = lines[i].split("_");
            graph.addEdge("lin-" + i, [parseInt(edge[0]), parseInt(edge[1])]);
        }
    }

    var count = 0;
    for(var i = 0; i < components.length; i++){
        if(Object.keys(components[i]).length > 0){
            edge = components[i];
            if(edge.pins.length == 2){
                graph.addEdge(edge.type + "-" + edge.id, edge.pins);
            }else{
                graph.addEdge(edge.type + "-" + edge.id, [edge.pins[1], edge.pins[3]]);
                if(edge.type === "cccs" || edge.type === "ccvs"){
                    graph.addEdge("lin-" + (lines.length + count), [edge.pins[0], edge.pins[2]]);
                    count++;
                }
            }
        }
    }
    return graph;
}

function spanningTree(graph){
    var tree = new Graph();
    for(var id in graph.nodes){
        tree.addNode(id);
        break;
    }
    var edge, nodeId2;
    var edgeFound;
    var edgeId;
    var counter = 0;
    while(tree.nodeCount() < graph.nodeCount() && counter < 1000){
        edgeFound = false;
        for(var nodeId in tree.nodes){
            for(var i = 0; i < graph.nodes[nodeId].length; i++){
                edgeId = graph.nodes[nodeId][i];
                edge = graph.edges[edgeId];
                if(edge[0] === parseInt(nodeId)){
                    nodeId2 = edge[1];
                }else{
                    nodeId2 = edge[0];
                }
                if(tree.nodes[nodeId2] === undefined){
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

function mergeNodeGroups(nodeGroups, edge){
    var nodeGroup1, nodeGroup2;
    for(var i = 0; i < nodeGroups.length; i++){
        if(nodeGroups[i].indexOf(edge[0]) !== -1){
            nodeGroup1 = i;
        }
        if(nodeGroups[i].indexOf(edge[1]) !== -1){
            nodeGroup2 = i;
        }
    }
    if(nodeGroup1 !== nodeGroup2){
        nodeGroups[nodeGroup1] = nodeGroups[nodeGroup1].concat(nodeGroups[nodeGroup2]);
        nodeGroups.splice(nodeGroup2, 1);
    }
}

function getNodeGroups(graph){
    var nodeGroups = [];
    for(var nodeId in graph.nodes){
        nodeGroups.push([parseInt(nodeId)]);
    }
    for(var edgeId in graph.edges){
        if(edgeId.includes("lin")){
            mergeNodeGroups(nodeGroups, graph.edges[edgeId]);
        }
    }
    return nodeGroups;
}

function getCycleBasis(graph){
    var tree = spanningTree(graph);
    var cycles = [];
    var edges = {};
    var edge, edgeId;
    for(var nodeId in graph.nodes){
        for(var i = 0; i < graph.nodes[nodeId].length; i++){
            edgeId = graph.nodes[nodeId][i];
            if(!tree.edges[edgeId]){
                edges[edgeId] = graph.edges[edgeId];
            }
        }
    }
    var cycle;
    for(var e in edges){
        edge = edges[e];
        cycle = findCycle(tree, edge);
        if(cycle !== undefined){
            cycles.push(cycle);
        }
    }
    return cycles;
}

function findCycle(graph, edge){
    return findPath(graph, edge[1], edge[0]);
}

function findPath(graph, nodeId1, nodeId2){
    var stack = [];
    var neighbours;
    var ancestors = {};
    var node;

    stack.push(nodeId1);
    var visited = {};
    for(var id in graph.nodes){
        visited[id] = false;
    }
    while(stack.length > 0){
        node = stack.pop();
        if(node === nodeId2){
            break;
        }

        if(!visited[node]){
            visited[node] = true;
            neighbours = graph.neighbours(node);
            for(var i = 0; i < neighbours.length; i++){
                if(!visited[neighbours[i]]){
                    ancestors[neighbours[i]] = node;
                    stack.push(neighbours[i]);
                }
            }
        }
    }
    var nodePath = [node];
    while(ancestors[node] !== undefined){
        node = ancestors[node];
        nodePath.push(node);
    }

    if(nodePath[nodePath.length - 1] === nodeId1 && nodePath[0] === nodeId2){
        return nodePath;
    }else{
        return undefined;
    }
}
