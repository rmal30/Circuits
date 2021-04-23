"use strict";

class CycleSpace {
    
    static findCycleWithEdge(graph, edge) {
        return PathFinding.dfs(graph, edge[1], edge[0]);
    }

    static getBasis(graph) {
        const tree = SpanningTree.getSpanningTree(graph);
        const cycles = [];
        const edges = {};
        let edgeId;

        for (const nodeId in graph.nodes) {
            for (let i = 0; i < graph.nodes[nodeId].length; i++) {
                edgeId = graph.nodes[nodeId][i];
                if (!tree.edges[edgeId]) {
                    edges[edgeId] = graph.edges[edgeId];
                }
            }
        }

        for (const edgeId in edges) {
            const cycle = CycleSpace.findCycleWithEdge(tree, edges[edgeId]);
            if(cycle !== undefined) {
                cycles.push(cycle);
            }
        }

        return cycles;
    }

}