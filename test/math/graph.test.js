import Graph from "../../public/scripts/math/graph.js";
import assert from "assert";

describe("Graph", () => {

    let graph;

    beforeEach(() => {
        graph = new Graph();
    });

    it("Constructor creates empty graph", () => {
        assert.deepStrictEqual(graph.nodes, {});
        assert.deepStrictEqual(graph.edges, {});
    });
    
    it("Adds new node", () => {
        graph.addNode("0");
        assert.deepStrictEqual(graph.nodes["0"], {edges: new Set()});
        assert.strictEqual(graph.nodeCount(), 1);
    });

    it("Adds new edge", () => {
        graph.addNode("0");
        graph.addNode("1");
        graph.addEdge("edge", "0", "1", "Label");

        assert.deepStrictEqual(graph.nodes, {
            "0": {edges: new Set(["edge"])},
            "1": {edges: new Set(["edge"])},
        });
        assert.deepStrictEqual(graph.edges, {
            edge: {
                node1: "0",
                node2: "1",
                info: "Label" 
            }
        });
        assert.strictEqual(graph.nodeCount(), 2);
        assert.strictEqual(graph.edgeCount(), 1);
    });

    it("Removes edge", () => {
        graph.addNode("0");
        graph.addNode("1");
        graph.addEdge("edge", "0", "1", "Label");
        graph.removeEdge("edge");

        assert.deepStrictEqual(graph.nodes, {
            "0": {edges: new Set()},
            "1": {edges: new Set()},
        });
        assert.deepStrictEqual(graph.edges, {});
        assert.strictEqual(graph.nodeCount(), 2);
        assert.strictEqual(graph.edgeCount(), 0);
    });

    it("Contracts edge", () => {
        graph.addNode("0");
        graph.addNode("1");
        graph.addNode("2");
        graph.addEdge("edge1", "0", "1", "Label1");
        graph.addEdge("edge2", "1", "2", "Label2");
        graph.addEdge("edge3", "2", "0", "Label3");
        graph.contractEdge("edge3");

        assert.deepStrictEqual(graph.nodes, {
            "2:0": {edges: new Set(["edge1", "edge2"])},
            "1": {edges: new Set(["edge1", "edge2"])},
        });
        assert.deepStrictEqual(graph.edges, {
            edge1: {
                node1: "2:0",
                node2: "1",
                info: "Label1" 
            },
            edge2: {
                node1: "1",
                node2: "2:0",
                info: "Label2" 
            }
        });
        assert.strictEqual(graph.nodeCount(), 2);
        assert.strictEqual(graph.edgeCount(), 2);
    });

    it("Gets neighbours", () => {
        graph.addNode("0");
        graph.addNode("1");
        graph.addEdge("edge", "0", "1", "Label");
        assert.deepStrictEqual(graph.neighbours("0"), new Set("1"));
        assert.deepStrictEqual(graph.neighbours("1"), new Set("0"));
    });

    it("Gets edges", () => {
        graph.addNode("0");
        graph.addNode("1");
        graph.addEdge("edge1", "0", "1", "Label1");
        graph.addEdge("edge2", "1", "0", "Label2");
        assert.deepStrictEqual(graph.getEdges("0", "1"), new Set(["edge1", "edge2"]));
        assert.deepStrictEqual(graph.getEdges("1", "0"), new Set(["edge1", "edge2"]));
    });

    it("Can create an deep copy", () => {
        graph.addNode("0");
        graph.addNode("1");
        graph.addNode("2");
        graph.addEdge("edge1", "0", "1", "Label1");
        graph.addEdge("edge2", "1", "2", "Label2");
        graph.addEdge("edge3", "2", "0", "Label3");
        

        const expectedNodes = {
            "0": {edges: new Set(["edge1", "edge3"])},
            "1": {edges: new Set(["edge1", "edge2"])},
            "2": {edges: new Set(["edge2", "edge3"])},
        };

        const expectedEdges = {
            edge1: {
                node1: "0",
                node2: "1",
                info: "Label1" 
            },
            edge2: {
                node1: "1",
                node2: "2",
                info: "Label2" 
            },
            edge3: {
                node1: "2",
                node2: "0",
                info: "Label3" 
            }
        };

        const graph2 = graph.copy();
        assert.deepStrictEqual(graph2.nodes, expectedNodes);
        assert.deepStrictEqual(graph2.edges, expectedEdges);
        graph2.contractEdge("edge3");
        assert.deepStrictEqual(graph.nodes, expectedNodes);
        assert.deepStrictEqual(graph.edges, expectedEdges);
    });
});