class SpanningTree {

    static getSpanningTree(graph) {
        const tree = new Graph();

        const [id] = Object.keys(graph.nodes);
        tree.addNode(id);

        while (tree.nodeCount() < graph.nodeCount()) {
            let edgeFound = false;
            for (const nodeId of Object.keys(tree.nodes)) {
                for (const edgeId of graph.nodes[nodeId]) {
                    const [node1, node2] = graph.edges[edgeId];
                    const neighbourId = node1 === parseInt(nodeId, 10) ? node2 : node1;

                    if (!(neighbourId in tree.nodes)) {
                        tree.addNode(neighbourId);
                        tree.addEdge(edgeId, [parseInt(nodeId, 10), neighbourId]);
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
