import Graph from "../../public/scripts/math/graph.js";
import TraversalMethods from "../../public/scripts/math/traversal_methods.js";
import assert from "assert"

describe("Traversal methods", () => {
    describe("DFS", () => {
        const testFunc = TraversalMethods.dfs;
        it("Tree", () => {

            /*
                 1
                / \
               2   3
              / \   \
             4   5   6
            */
            const graph = new Graph();
            for(let i=1; i<=6; i++){
                graph.addNode(`node${i}`);
            }
            
            graph.addEdge("edge1", "node1", "node2", "label1");
            graph.addEdge("edge2", "node1", "node3", "label2");
            graph.addEdge("edge3", "node2", "node4", "label3");
            graph.addEdge("edge4", "node2", "node5", "label4");
            graph.addEdge("edge5", "node3", "node6", "label5");

            const expected = {
                children: {
                    node1: new Set(["node2", "node3"]),
                    node3: new Set(["node6"]),
                    node6: new Set(),
                    node2: new Set(["node4", "node5"]),
                    node5: new Set(),
                    node4: new Set()
                },
                parents:{
                    node2: "node1",
                    node3: "node1",
                    node6: "node3",
                    node4: "node2",
                    node5: "node2"
                }
            };
            const result = testFunc(graph.neighbours.bind(graph), "node1");
            assert.deepStrictEqual(result, expected);
        });

        it("Graph with cycles", () => {

            /*
                 1             1
                / \             \
               2 - 3    ->   2   3
              / \ / \       /     \
             4 - 5 - 6     4 - 5 - 6
            */
             const graph = new Graph();
             for(let i=1; i<=6; i++){
                 graph.addNode(`node${i}`);
             }
             
             graph.addEdge("edge1", "node1", "node2", "label1");
             graph.addEdge("edge2", "node1", "node3", "label2");
             graph.addEdge("edge3", "node2", "node3", "label3");
             graph.addEdge("edge4", "node2", "node4", "label4");
             graph.addEdge("edge5", "node2", "node5", "label5");
             graph.addEdge("edge6", "node4", "node5", "label6");
             graph.addEdge("edge7", "node3", "node5", "label7");
             graph.addEdge("edge8", "node6", "node3", "label8");
             graph.addEdge("edge9", "node6", "node5", "label9");
 
             const expected = {
                 children: {
                     node1: new Set(["node3"]),
                     node2: new Set([]),
                     node3: new Set(["node6"]),
                     node4: new Set(["node2"]),
                     node5: new Set(["node4"]),
                     node6: new Set(["node5"])
                 },
                 parents:{
                     node3: "node1",
                     node4: "node5",
                     node6: "node3",
                     node5: "node6",
                     node2: "node4"
                 }
             };
             const result = testFunc(graph.neighbours.bind(graph), "node1");
             assert.deepStrictEqual(result, expected);
        });
    });

})