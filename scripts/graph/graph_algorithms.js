import Graph from "./graph.js";
export default class GraphAlgorithms {

    /**
     * DFS algorithm to traverse a graph
     * @param {any} graph - Graph to traverse
     * @param {string} start - Start node id
     * @returns {{children: {}, parents: {}}} Children tree, parents map
     */
    static dfs(graph, start) {
        const stack = [];
        const children = {};
        const parents = {};

        stack.push(start);
        const visited = new Set();

        while (stack.length > 0) {
            const node = stack.pop();
            if (!visited.has(node)) {
                visited.add(node);
                children[node] = new Set();
                for (const neighbour of graph.neighbours(node)) {
                    if (!visited.has(neighbour)) {
                        children[node].add(neighbour);
                        parents[neighbour] = node;
                        stack.push(neighbour);
                    }
                }
            }
        }

        return {children, parents};
    }

    /**
     * Get path from start node to end node via a traversal function
     * @static
     * @param {any} graph - Graph
     * @param {string} start - Start node
     * @param {string} end - End node
     * @param {function} traversalFunc - Traversal function
     * @returns {{}} - Map of edges and their directions
     */
    static findPath(graph, start, end, traversalFunc) {
        const ancestors = traversalFunc(graph, end).parents;
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
     * @param {any} component - Component
     * @param {function} traversalFunc - Traversal function
     * @returns {any} - Spanning tree
     */
    static findSpanningTree(component, traversalFunc) {
        const tree = new Graph();

        const [id] = Object.keys(component.nodes);
        const {children} = traversalFunc(component, id);
        tree.addNode(id);

        for (const node of Object.keys(children)) {
            if (!(node in tree.nodes)) {
                tree.addNode(node);
            }
            for (const neighbour of children[node]) {
                if (!(neighbour in tree.nodes)) {
                    tree.addNode(neighbour);
                    const [edgeId] = component.getEdges(node, neighbour);
                    const edge = component.edges[edgeId];
                    tree.addEdge(edgeId, edge.node1, edge.node2, edge.info);
                }
            }
        }

        return tree;
    }

    /**
     * Find a list of independent cycles in a graph
     * @param {Graph} graph - Graph
     * @returns {Object<string, number>[]} - List of independent cycles
     */
    static findFundamentalCycleBasis(graph) {
        const tree = GraphAlgorithms.findSpanningTree(graph, GraphAlgorithms.dfs);
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
            const cycle = GraphAlgorithms.findPath(tree, edge.node2, edge.node1, GraphAlgorithms.dfs);
            if (cycle) {
                cycle[edgeId] = 1;
                cycles.push(cycle);
            }
        }

        return cycles;
    }

    static findNodeFlows(graph) {
        const nodes = [];
        for (const nodeId of Object.keys(graph.nodes)) {
            const node = {};
            for (const edgeId of graph.nodes[nodeId].edges) {
                if (graph.edges[edgeId].node1 === nodeId && graph.edges[edgeId].node2 !== nodeId) {
                    node[edgeId] = 1;
                } else if (graph.edges[edgeId].node2 === nodeId && graph.edges[edgeId].node1 !== nodeId) {
                    node[edgeId] = -1;
                } else {
                    node[edgeId] = 0;
                }
            }
            nodes.push(node);
        }

        return nodes;
    }
}
