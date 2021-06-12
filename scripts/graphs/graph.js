export default class Graph {
    constructor() {
        this.nodes = {};
        this.edges = {};
    }

    nodeCount() {
        return Object.keys(this.nodes).length;
    }

    edgeCount() {
        return Object.keys(this.edges).length;
    }

    addNode(id) {
        this.nodes[id] = {edges: new Set()};
    }

    addEdge(id, nodeId1, nodeId2, info) {
        this.edges[id] = {node1: nodeId1, node2: nodeId2};
        this.nodes[nodeId1].edges.add(id);
        this.nodes[nodeId2].edges.add(id);
        this.edges[id].info = info;
    }

    removeEdge(id) {
        const edge = this.edges[id];
        this.nodes[edge.node1].edges.delete(id);
        this.nodes[edge.node2].edges.delete(id);
        delete this.edges[id];
    }

    contractEdge(id) {
        const edge = this.edges[id];
        this.nodes[edge.node1].edges.delete(id);
        this.nodes[edge.node2].edges.delete(id);
        const newId = `${edge.node1}:${edge.node2}`;
        this.nodes[newId] = {edges: new Set([...this.nodes[edge.node1].edges, ...this.nodes[edge.node2].edges])};
        this.nodes[newId].edges.forEach((edgeId) => {
            if (this.edges[edgeId].node1 === edge.node1 || this.edges[edgeId].node1 === edge.node2) {
                this.edges[edgeId].node1 = newId;
            }
            if (this.edges[edgeId].node2 === edge.node1 || this.edges[edgeId].node2 === edge.node2) {
                this.edges[edgeId].node2 = newId;
            }
        });
        delete this.nodes[edge.node1];
        delete this.nodes[edge.node2];
    }

    neighbours(nodeId) {
        const neighbours = new Set();

        if (nodeId in this.nodes) {
            for (const edgeId of this.nodes[nodeId].edges) {
                const edge = this.edges[edgeId];
                const otherNodeId = edge.node1 === nodeId ? edge.node2 : edge.node1;
                neighbours.add(otherNodeId);
            }
        }

        return neighbours;
    }

    getEdges(nodeId1, nodeId2) {
        const edges = new Set();

        for (const edgeId of this.nodes[nodeId1].edges) {
            const edge = this.edges[edgeId];
            if ([edge.node1, edge.node2].includes(nodeId2)) {
                edges.add(edgeId);
            }
        }

        return edges;
    }

    copy() {
        const newGraph = new Graph();

        for (const nodeId of Object.keys(this.nodes)) {
            newGraph.nodes[nodeId] = {edges: new Set([...this.nodes[nodeId].edges])};
        }

        for (const edgeId of Object.keys(this.edges)) {
            const {node1, node2, info} = this.edges[edgeId];
            newGraph.edges[edgeId] = {node1: node1, node2: node2, info: info};
        }

        return newGraph;
    }
}
