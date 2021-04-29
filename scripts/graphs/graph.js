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
        this.nodes[id] = new Set();
    }

    addEdge(id, nodeIds) {
        this.edges[id] = nodeIds;
        this.nodes[nodeIds[0]].add(id);
        this.nodes[nodeIds[1]].add(id);
    }

    removeEdge(id, nodeIds) {
        this.nodes[nodeIds[0]].delete(id);
        this.nodes[nodeIds[1]].delete(id);
        delete this.edges[id];
    }

    neighbours(nodeId) {
        const neighbours = [];

        if (nodeId in this.nodes) {
            for (const edgeId of this.nodes[nodeId]) {
                const [nodeId1, nodeId2] = this.edges[edgeId];
                if (nodeId1 === parseInt(nodeId, 10)) {
                    neighbours.push(nodeId2);
                } else {
                    neighbours.push(nodeId1);
                }
            }
        }

        return neighbours;
    }

    getEdge(nodeId1, nodeId2) {
        const edges = this.nodes[nodeId1];

        for (const edgeId of edges) {
            const edge = this.edges[edgeId];
            if (edge.some((node) => node === parseInt(nodeId2, 10))) {
                return edgeId;
            }
        }

        return null;
    }
}
