class SpanningTree {

    static getSpanningTree(graph) {
        const tree = new Graph();

        for (const id in graph.nodes) {
            tree.addNode(id);
            break;
        }

        let edge, nodeId2;
        let edgeFound;
        let edgeId;

        while (tree.nodeCount() < graph.nodeCount()) {
            edgeFound = false;
            for (const nodeId in tree.nodes) {
                for (let i = 0; i < graph.nodes[nodeId].length; i++) {
                    edgeId = graph.nodes[nodeId][i];
                    edge = graph.edges[edgeId];

                    if (edge[0] === parseInt(nodeId)) {
                        nodeId2 = edge[1];
                    } else {
                        nodeId2 = edge[0];
                    }

                    if (tree.nodes[nodeId2] === undefined) {
                        tree.addNode(nodeId2);
                        tree.addEdge(edgeId, [parseInt(nodeId), nodeId2]);
                        edgeFound = true;
                        break;
                    }
                }
                if (edgeFound) {
                    break;
                }
            }
        }
        return tree;
    }
}