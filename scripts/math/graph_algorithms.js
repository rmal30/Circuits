import Graph from "./graph.js";
export default class GraphAlgorithms {

    constructor (traversalFunc) {
        this.traversalFunc = traversalFunc;
    }

    /**
     * Get path from start node to end node via a traversal function
     * @static
     * @param {Graph} graph - Graph
     * @param {string} start - Start node
     * @param {string} end - End node
     * @returns {{}} - Map of edges and their directions
     */
    findPath(graph, start, end) {
        const ancestors = this.traversalFunc(graph.neighbours.bind(graph), end).parents;
        let node = start;
        let node2 = null;
        const nodePath = {};
        while (node in ancestors) {
            node2 = ancestors[node];
            const [edgeId] = graph.getEdges(node, node2);
            nodePath[edgeId] = graph.edges[edgeId].node1 === node ? 1 : -1;
            node = node2;
        }
        return nodePath;
    }

    /**
     * Get spanning tree
     * @param {Graph} component - Component
     * @returns {any} - Spanning tree
     */
    findSpanningTree(component) {
        const tree = new Graph();

        const [id] = Object.keys(component.nodes);
        tree.addNode(id);

        const {children} = this.traversalFunc(component.neighbours.bind(component), id);
        for (const node of Object.keys(children)) {
            for (const neighbour of children[node]) {
                tree.addNode(node);
                tree.addNode(neighbour);
                const [edgeId] = component.getEdges(node, neighbour);
                const edge = component.edges[edgeId];
                tree.addEdge(edgeId, edge.node1, edge.node2, edge.info);
            }
        }

        return tree;
    }

    /**
     * Find a list of independent cycles in a graph
     * @param {Graph} graph - Graph
     * @returns {Object<string, number>[]} - List of independent cycles
     */
    findFundamentalCycleBasis(graph) {
        const tree = this.findSpanningTree(graph);
        const cycles = [];
        const edges = {};

        for (const nodeId of Object.keys(graph.nodes)) {
            for (const edgeId of graph.nodes[nodeId].edges) {
                if (!(edgeId in tree.edges)) {
                    edges[edgeId] = graph.edges[edgeId];
                }
            }
        }

        for (const edgeId of Object.keys(edges)) {
            const edge = edges[edgeId];
            const cycle = this.findPath(tree, edge.node2, edge.node1);
            if (cycle) {
                cycle[edgeId] = edge.node1 === edge.node2 ? 0 : 1;
                cycles.push(cycle);
            }
        }

        return cycles;
    }

    findNodeFlows(graph) {
        const nodes = [];
        for (const nodeId of Object.keys(graph.nodes)) {
            const node = {};
            for (const edgeId of graph.nodes[nodeId].edges) {
                if (graph.edges[edgeId].node1 === nodeId && graph.edges[edgeId].node2 !== nodeId) {
                    node[edgeId] = -1;
                } else if (graph.edges[edgeId].node2 === nodeId && graph.edges[edgeId].node1 !== nodeId) {
                    node[edgeId] = 1;
                } else {
                    node[edgeId] = 0;
                }
            }
            nodes.push(node);
        }

        return nodes;
    }
}
