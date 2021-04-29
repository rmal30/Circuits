class PathFinding {

    static getReversePath(endNode, ancestors) {
        let node = endNode;
        const nodePath = [node];
        while (node in ancestors) {
            node = ancestors[node];
            nodePath.push(node);
        }
        return nodePath;
    }

    static dfs(graph, startNodeId, endNodeId) {
        const stack = [];
        const ancestors = {};

        stack.push(startNodeId);
        const visited = new Set();
        while (stack.length > 0) {
            const node = stack.pop();
            if (node === endNodeId) {
                return PathFinding.getReversePath(endNodeId, ancestors);
            }

            if (!visited.has(node)) {
                visited.add(node);
                const neighbours = graph.neighbours(node);
                for (const neighbour of neighbours) {
                    if (!visited.has(neighbour)) {
                        ancestors[neighbour] = node;
                        stack.push(neighbour);
                    }
                }
            }
        }

        return null;
    }
}
