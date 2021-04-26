class SpanningTree {

    static getSpanningTree(graph) {
        const tree = new Graph();

        const [id] = Object.keys(graph.nodes);
        tree.addNode(id);

        while (tree.nodeCount() < graph.nodeCount()) {
            let edgeFound = false;
            for (const nodeId in tree.nodes) {
                for (const edgeId of graph.nodes[nodeId]) {
                    const [node1, node2] = graph.edges[edgeId];
                    let nodeId2;

                    if (node1 === parseInt(nodeId)) {
                        nodeId2 = node2;
                    } else {
                        nodeId2 = node1;
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

            if (!edgeFound) {
                return null;
            }
        }

        return tree;
    }
}
