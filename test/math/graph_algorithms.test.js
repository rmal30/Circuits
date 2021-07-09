import Graph from "../../public/scripts/math/graph.js";
import GraphAlgorithms from "../../public/scripts/math/graph_algorithms.js";
import TraversalMethods from "../../public/scripts/math/traversal_methods.js";
import assert from "assert";

const graphs = {
    singleNode: (a) => {
        const graph = new Graph();
        graph.addNode("node1");
        for(let i=1; i<=a; i++) {
            graph.addEdge(`edge${i}`, "node1", "node1", `label${i}`);
        }
        return graph;
    },
    twoNodes: (a, b) => {
        const graph = new Graph();
        graph.addNode("node1");
        graph.addNode("node2");

        for(let i=1; i<=a; i++){
            graph.addEdge(`edge${i}`, "node1", "node2", `label${i}`);
        }

        for(let i=1; i<=b; i++){
            graph.addEdge(`edge${a + i}`, "node2", "node1", `label${a + i}`);
        }

        return graph;
    },

    threeNodes: (a, b, c) => {
        const graph = new Graph();
        graph.addNode("node1");
        graph.addNode("node2");
        graph.addNode("node3");

        for(let i=1; i<=a; i++){
            graph.addEdge(`edge${i}`, "node1", "node2", `label${i}`);
        }

        for(let i=1; i<=b; i++){
            graph.addEdge(`edge${a + i}`, "node2", "node3", `label${a + i}`);
        }

        for(let i=1; i<=c; i++){
            graph.addEdge(`edge${a + b + i}`, "node3", "node1", `label${a + b + i}`);
        }
        return graph;
    },

    doubleTriangle: () => {
        /*
             1             1
            / \             \
           2 - 3    ->   2   3
            \ /           \ /
             4             4 
        */
        const graph = new Graph();
        for(let i=1; i<=4; i++){
            graph.addNode(`node${i}`);
        }
        
        graph.addEdge("edge1", "node1", "node2", "label1");
        graph.addEdge("edge2", "node1", "node3", "label2");
        graph.addEdge("edge3", "node2", "node3", "label3");
        graph.addEdge("edge4", "node2", "node4", "label4");
        graph.addEdge("edge5", "node4", "node3", "label5");
        return graph;
    }


}

describe("Graph algorithms", () => {
    
    let graphAlgorithms;
    beforeEach(() => {
        graphAlgorithms = new GraphAlgorithms(TraversalMethods.dfs);
    });

    describe("Finds path", () => {
        it("Pair: node1 -> node2", () => {
            const graph = graphs.twoNodes(1, 0);
    
            const expected = {
                edge1: 1, 
            }
            const result = graphAlgorithms.findPath(graph, "node1", "node2");
            assert.deepStrictEqual(result, expected);
        });

        it("Pair: node1 <- node2", () => {
            const graph = graphs.twoNodes(0, 1);
    
            const expected = {
                edge1: -1, 
            }
            const result = graphAlgorithms.findPath(graph, "node1", "node2");
            assert.deepStrictEqual(result, expected);
        });

        it("Pair: node1 <-> node2", () => {
            const graph = graphs.twoNodes(1, 1);
    
            const expected = {
                edge1: 1, 
            }
            const result = graphAlgorithms.findPath(graph, "node1", "node2");
            assert.deepStrictEqual(result, expected);
        });

        it("Triple", () => {
            const graph = graphs.threeNodes(1, 1, 0);
            const expected = {
                edge1: 1, 
                edge2: 1
            }
            const result = graphAlgorithms.findPath(graph, "node1", "node3");
            assert.deepStrictEqual(result, expected);
        });

        it("Double triangle", () => {
            const graph = graphs.doubleTriangle();
    
            const expected = {
                edge1: 1, 
                edge5: -1,
                edge3: 1
            }
            const result = graphAlgorithms.findPath(graph, "node1", "node4");
            assert.deepStrictEqual(result, expected);
        });
    
    })

    describe("Finds spanning tree", () => {
        it("Single node", () => {
            const graph = graphs.singleNode(2);
            const spanningTree = graphAlgorithms.findSpanningTree(graph);
            const expectedTree = new Graph();
            expectedTree.addNode("node1");
            assert.deepStrictEqual(spanningTree, expectedTree);
        });

        it("Pair", () => {
            const graph = graphs.twoNodes(2, 1);
            const spanningTree = graphAlgorithms.findSpanningTree(graph);
            const expectedTree = {
                nodes: {
                    node1: {
                        edges: new Set(["edge1"])
                    },
                    node2: {
                        edges: new Set(["edge1"])
                    }
                },
                edges: {
                    edge1: {
                        node1: 'node1',
                        node2: 'node2',
                        info: 'label1'
                    }
                }
            };
            assert.deepStrictEqual(JSON.stringify(spanningTree), JSON.stringify(expectedTree));
        });

        it("Double triangle", () => {
            const graph = graphs.doubleTriangle();
            const spanningTree = graphAlgorithms.findSpanningTree(graph);
            assert.strictEqual(spanningTree.nodeCount(), graph.nodeCount());
            assert.strictEqual(spanningTree.edgeCount(), graph.nodeCount() - 1);
            const connectedNodesCount = Object.keys(TraversalMethods.dfs(spanningTree.neighbours.bind(spanningTree), "node1").parents).length;
            assert.strictEqual(connectedNodesCount, graph.nodeCount() - 1);
        });

        it("Four node loop", () => {
            const graph = new Graph();
            graph.nodes = {
                "0":{"edges": new Set(["0", "1"])},
                "1":{"edges": new Set(["0", "3"])},
                "2":{"edges": new Set(["1", "2"])},
                "4":{"edges": new Set(["2", "3"])}
            };
            
            graph.edges = {
                "0":{"node1":"0","node2":"1","info":{"type":"res","value":2}},
                "1":{"node1":"2","node2":"0","info":{"type":"cap","value":3}},
                "2":{"node1":"4","node2":"2","info":{"type":"ind","value":5}},
                "3":{"node1":"4","node2":"1","info":{"type":"vac","value":3}}
            };
            const spanningTree = graphAlgorithms.findSpanningTree(graph);
            assert.strictEqual(spanningTree.nodeCount(), graph.nodeCount());
            assert.strictEqual(spanningTree.edgeCount(), graph.nodeCount() - 1);
        })
    })


    describe("Cycle basis", () => {
        it("Single node", () => {
            const graph = graphs.singleNode(2);
            const result = graphAlgorithms.findFundamentalCycleBasis(graph);
            assert.deepStrictEqual(result, [
                {edge1: 0}, 
                {edge2: 0}
            ]);
        });

        it("Pair (cycle)", () => {
            const graph = graphs.twoNodes(1, 1);
            const result = graphAlgorithms.findFundamentalCycleBasis(graph);
            assert.deepStrictEqual(result, [
                {edge1: 1, edge2: 1}
            ]);
        });

        it("Triple cycle", () => {
            const graph = graphs.threeNodes(1, 1, 1);
            const result = graphAlgorithms.findFundamentalCycleBasis(graph);
            assert.deepStrictEqual(result, [
                {edge1: 1, edge2: 1, edge3: 1}
            ]);
        });

        it("Double triangle", () => {
            const graph = graphs.doubleTriangle();
            const result = graphAlgorithms.findFundamentalCycleBasis(graph);
            const expected = [
                {edge1: 1, edge2: -1, edge4: 1, edge5: 1},
                {edge3: 1, edge4: -1, edge5: -1}
            ]
            assert.deepStrictEqual(result, expected);
        });
    });

    describe("Node flows", () => {
        it("Single node", () => {
            const graph = graphs.singleNode(2);
            const result = graphAlgorithms.findNodeFlows(graph);
            const expected = [
                {edge1: 0, edge2: 0}
            ];
            assert.deepStrictEqual(result, expected);
        });

        it("Single pair", () => {
            const graph = graphs.twoNodes(1, 0);
    
            const expected = [
                {edge1: -1},
                {edge1: 1}
            ];
            const result = graphAlgorithms.findNodeFlows(graph);
            assert.deepStrictEqual(result, expected);
        });

        it("Single pair 2", () => {
            const graph = graphs.twoNodes(0, 1);
    
            const expected = [
                {edge1: 1},
                {edge1: -1}
            ];
            const result = graphAlgorithms.findNodeFlows(graph);
            assert.deepStrictEqual(result, expected);
        });

        it("Double pair", () => {
            const graph = graphs.twoNodes(1, 1);
    
            const expected = [
                {edge1: -1, edge2: 1},
                {edge1: 1, edge2: -1}
            ];
            const result = graphAlgorithms.findNodeFlows(graph);
            assert.deepStrictEqual(result, expected);
        });

        it("Triple", () => {
            const graph = graphs.threeNodes(2, 2, 2);
    
            const expected = [
                {edge1: -1, edge2: -1, edge5: 1, edge6: 1},
                {edge1: 1, edge2: 1, edge3: -1, edge4: -1},
                {edge3: 1, edge4: 1, edge5: -1, edge6: -1},
            ];
            const result = graphAlgorithms.findNodeFlows(graph);
            assert.deepStrictEqual(result, expected);
        });

        it("Double triangle", () => {
            const graph = graphs.doubleTriangle();
            const result = graphAlgorithms.findNodeFlows(graph);
            const expected = [
                {edge1: -1, edge2: -1},
                {edge1: 1, edge3: -1, edge4: -1},
                {edge2: 1, edge3: 1, edge5: 1},
                {edge4: 1, edge5: -1},
            ]
            assert.deepStrictEqual(result, expected);
        });
    });
});