"use strict";

class Graph {
    constructor() {
        this.nodes = {};
        this.edges = {};
    }

    nodeCount() {
        return Object.keys(this.nodes).length;
    }

    addNode(id) {
        this.nodes[id] = [];
    }

    addEdge(id, nodeIds) {
        this.edges[id] = nodeIds;
        this.nodes[nodeIds[0]].push(id);
        this.nodes[nodeIds[1]].push(id);
    }

    removeEdge(id, nodeIds) {
        removeValueFromArray(this.nodes[nodeIds[0]], id);
        removeValueFromArray(this.nodes[nodeIds[1]], id);
        delete this.edges[id];
    }

    neighbours(nodeId) {
        const neighbours = [];

        if (this.nodes[nodeId] !== undefined) {
            for (const edgeId of this.nodes[nodeId]) {
                let nodeId2;
                if (this.edges[edgeId][0] === parseInt(nodeId)) {
                    nodeId2 = this.edges[edgeId][1];
                } else {
                    nodeId2 = this.edges[edgeId][0];
                }
                neighbours.push(nodeId2);
            }
        }

        return neighbours;
    }

    getEdge(nodeId1, nodeId2) {
        const edges = this.nodes[nodeId1];

        for (const edgeId of edges) {
            const edge = this.edges[edgeId];
            if (edge.some((node) => node === parseInt(nodeId2))) {
                return edgeId;
            }
        }

        return null;
    }
}