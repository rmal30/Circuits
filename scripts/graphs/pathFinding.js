class PathFinding {

    static getReversePath(endNode, ancestors) {
        let node = endNode;
        const nodePath = [node];
        while (ancestors[node] !== undefined) {
            node = ancestors[node];
            nodePath.push(node);
        }
        return nodePath;
    }

    static dfs(graph, startNodeId, endNodeId) {
        const stack = [];
        const ancestors = {};
        let node;

        stack.push(startNodeId);
        const visited = new Set();
        while (stack.length > 0) {
            node = stack.pop();
            if (node === endNodeId) {
                return PathFinding.getReversePath(endNodeId, ancestors);
            }

            if (!visited.has(node)) {
                visited.add(node);
                const neighbours = graph.neighbours(node);
                for (let i = 0; i < neighbours.length; i++) {
                    if (!visited.has(neighbours[i])) {
                        ancestors[neighbours[i]] = node;
                        stack.push(neighbours[i]);
                    }
                }
            }
        }
        
        return null;
    }
}