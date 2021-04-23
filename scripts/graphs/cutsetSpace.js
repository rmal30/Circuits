"use strict";

class CutsetSpace {

    static mergeNodeGroups(nodeGroups, edge) { 
        let nodeGroup1, nodeGroup2;

        for (let i = 0; i < nodeGroups.length; i++) {
            if (nodeGroups[i].includes(edge[0])) {
                nodeGroup1 = i;
            }
            if (nodeGroups[i].includes(edge[1])) {
                nodeGroup2 = i;
            }
        }

        if (nodeGroup1 !== nodeGroup2) {
            nodeGroups[nodeGroup1] = nodeGroups[nodeGroup1].concat(nodeGroups[nodeGroup2]);
            nodeGroups.splice(nodeGroup2, 1);
        }
    }

    static getBasis(graph) {
        const nodeGroups = [];

        for (const nodeId in graph.nodes) {
            nodeGroups.push([parseInt(nodeId)]);
        }

        for (const edgeId in graph.edges) {
            if(edgeId.includes("lin")) {
                CutsetSpace.mergeNodeGroups(nodeGroups, graph.edges[edgeId]);
            }
        }

        return nodeGroups;
    }
}