function Graph(){
    this.nodes = {};

    this.addNode = function(index){
        this.nodes[index] = new Node(index);
    }

    this.addEdge = function(type, index, node1, node2){
        node1.edges.push(new Edge(type, index, node1, node2));
        node2.edges.push(new Edge(type, index, node1, node2));
    }

    this.adjacent = function(node1, node2){
        for(var i=0; i<node1.edges.length; i++){
            if(node2.index === node1.edges[i].node1.index || node2.index === node1.edges[i].node2.index){
                return true;
            }
        }    
        return false;
    }
}

function Edge(type, index, node1, node2){
    this.type = type;
    this.index = index;
    this.node1 = node1;
    this.node2 = node2;
}

function Node(index){
    this.index = index;
    this.edges = [];
    this.neighbours = function(){
        var neighbours = [];
        for(var i=0; i<this.edges.length; i++){
            if(this.edges[i].node1.index != this.index){
                neighbours.push(this.edges[i].node1);
            }else{
                neighbours.push(this.edges[i].node2);
            }
        }
        return neighbours;
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
        graph.addEdge("", i, graph.nodes[edge[0]], graph.nodes[edge[1]]);
    }

    for(var i=0; i<components.length; i++){
        edge = components[i];   
        graph.addEdge(edge.type, edge.id, graph.nodes[edge.pins[0]], graph.nodes[edge.pins[1]]);
    }
    return graph;
}

function DFS(graph){
    var list = [];
    var tree = new Graph();
    var node = graph.nodes[0];
    var edge;
    var nodeIndex;
    var visited = {0:node};
    for(var i=0; i<node.edges.length; i++){
        edge = node.edges[i];
        list.push([edge.type, edge.id, edge.node1.index, edge.node2.index]);
    }
    while(list.length > 0){
        edge = list.pop();
        if(visited[edge[2]] == undefined){
            nodeIndex = edge[2];
        }else if(visited[edge[3]] == undefined){
            nodeIndex = edge[3];
        }else{
            continue;
        }
        tree.addNode(nodeIndex);
        tree.addEdge(edge[0], edge[1], tree.nodes[edge[2]], tree.nodes[edge[3]]);
        visited[nodeIndex] = true;
        for(var i=0; i<graph.nodes[nodeIndex].edges.length; i++){
            edge = graph.nodes[nodeIndex].edges[i];
            list.push([edge.type, edge.id, edge.node1.index, edge.node2.index]);
        }
    }
    return tree;
}


function findIndependentLoops(graph){
   // var nodes = 
}
