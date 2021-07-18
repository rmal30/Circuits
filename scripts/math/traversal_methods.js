export default class TraversalMethods {

    /**
     * Function that takes a node and returns its neighbours as a set
     * @typedef {function(string): Set<string>} neighboursCallback
    */

    /*
     * DFS algorithm to traverse a tree or graph structure
     * @param {neighboursCallback} getNeighbours - Function returning a set of neighbours of a node
     * @param {string} start - Start node id
     * @returns {{children: {}, parents: {}}} Children tree, parents map
     */

    static dfs(getNeighbours, start) {

        const children = {};
        const parents = {};

        const visited = new Set();
        const stack = [];
        stack.push(start);

        while (stack.length > 0) {
            const node = stack.pop();
            
            if (node && !visited.has(node)) {
                if (node in parents) {
                    children[parents[node]].add(node);
                }
                visited.add(node);
                children[node] = new Set();
                for (const neighbour of getNeighbours(node)) {
                    if (!visited.has(neighbour)) {
                        parents[neighbour] = node;
                        stack.push(neighbour);
                    }
                }
            }
        }

        return {children, parents};
    }
}