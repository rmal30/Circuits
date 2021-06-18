import {COMPONENT_TYPES} from "../config/components.js";
import Graph from "../math/graph.js";

export default class CircuitGraph extends Graph {

    constructor (circuit) {
        super();
        const nodeGroups = CircuitGraph.getNodeGroups(circuit);
        const reducedNodeIds = {};
        for (const nodeGroup of nodeGroups) {
            const minNode = Math.min.apply(null, [...nodeGroup]);
            for (const node of nodeGroup) {
                reducedNodeIds[node] = `${minNode}`;
            }
        }

        Object.keys(circuit.pins).forEach((pinID) => {
            this.addNode(reducedNodeIds[pinID]);
        });

        for (const id of Object.keys(circuit.components)) {
            if (circuit.components[id].pins.length === 2) {
                const [portA, portB] = circuit.components[id].pins.map((nodeId) => nodeId.toString());
                const {type, value} = circuit.components[id];
                this.addEdge(id, reducedNodeIds[portA], reducedNodeIds[portB], {type: type, value: value});
            } else {
                const [portA, portB, portC, portD] = circuit.components[id].pins.map((nodeId) => nodeId.toString());
                const {type, value} = circuit.components[id];
                this.addEdge(`${id}:2`, reducedNodeIds[portB], reducedNodeIds[portD], {
                    type: type,
                    value: value,
                    meter: `${id}:1`
                });
                switch (circuit.components[id].type) {
                    case COMPONENT_TYPES.VOLTAGE_CONTROLLED_VOLTAGE_SOURCE:
                    case COMPONENT_TYPES.VOLTAGE_CONTROLLED_CURRENT_SOURCE:
                        this.addEdge(`${id}:1`, reducedNodeIds[portA], reducedNodeIds[portC], {
                            type: COMPONENT_TYPES.VOLTAGE_METER
                        });
                        break;
                    case COMPONENT_TYPES.CURRENT_CONTROLLED_CURRENT_SOURCE:
                    case COMPONENT_TYPES.CURRENT_CONTROLLED_VOLTAGE_SOURCE:
                        this.addEdge(`${id}:1`, reducedNodeIds[portA], reducedNodeIds[portC], {
                            type: COMPONENT_TYPES.CURRENT_METER
                        });
                        break;
                    default:
                        break;
                }
            }
        }
    }


    /**
     * Group nodes of a circuit that are connected (directly or indirectly) via a line
     * @param {any} circuit - The graphical circuit
     * @returns {Set<any[]>} nodeGroups - A set of node groups
     */
    static getNodeGroups(circuit) {
        const nodeGroups = new Set();

        for (const lineId of Object.keys(circuit.lines)) {
            const [node1, node2] = circuit.lines[lineId];
            let nodeGroup1 = new Set([node1]);
            let nodeGroup2 = new Set([node2]);

            for (const nodeGroup of nodeGroups) {
                if (nodeGroup.has(node1)) {
                    nodeGroup1 = nodeGroup;
                }
                if (nodeGroup.has(node2)) {
                    nodeGroup2 = nodeGroup;
                }
            }

            if (nodeGroup1 !== nodeGroup2) {
                nodeGroups.add(new Set([...nodeGroup1, ...nodeGroup2]));
                nodeGroups.delete(nodeGroup1);
                nodeGroups.delete(nodeGroup2);
            }
        }
        return nodeGroups;
    }


    /**
     * Get edges with types
     * @param {string[]} componentTypes - List of types to include
     * @returns {string[]} - List of edges with types
     */
    getEdgesOfTypes(componentTypes) {
        const edges = [];
        for (const edge of Object.keys(this.edges)) {
            if (componentTypes.includes(this.edges[edge].info.type)) {
                edges.push(edge);
            }
        }
        return edges;
    }

    /**
     * Exclude edges with types
     * @param {string[]} componentTypes - List of types to exclude
     * @returns {Graph} - New graph with edges excluded
     */
    excludeEdgesOfTypes(componentTypes) {
        const newGraph = this.copy();
        const edges = this.getEdgesOfTypes(componentTypes);
        for (const edgeId of edges) {
            newGraph.removeEdge(edgeId);
        }
        return newGraph;
    }

    /**
     * Collapse/contract edges with types from graph
     * @param {string[]} componentTypes - Collapse edges with one of these types
     * @returns {Graph} - New graph with edges contracted
     */
    contractEdgesOfTypes(componentTypes) {
        const newGraph = this.copy();
        const edges = this.getEdgesOfTypes(componentTypes);
        for (const edgeId of edges) {
            newGraph.contractEdge(edgeId);
        }
        return newGraph;
    }
}
