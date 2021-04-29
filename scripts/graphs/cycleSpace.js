"use strict";

class CycleSpace {

    static findCycleWithEdge(graph, edge) {
        return PathFinding.dfs(graph, edge[1], edge[0]);
    }

    static getBasis(graph) {
        const tree = SpanningTree.getSpanningTree(graph);
        const cycles = [];
        const edges = {};

        for (const nodeId of Object.keys(graph.nodes)) {
            for (const edgeId of graph.nodes[nodeId]) {
                if (!tree.edges[edgeId]) {
                    edges[edgeId] = graph.edges[edgeId];
                }
            }
        }

        for (const edgeId of Object.keys(edges)) {
            const cycle = CycleSpace.findCycleWithEdge(tree, edges[edgeId]);
            if (cycle) {
                cycles.push(cycle);
            }
        }

        return cycles;
    }

}
