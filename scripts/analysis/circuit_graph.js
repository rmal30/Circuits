import {COMPONENT_TYPES} from "../components.js";
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
            this.addComponent(id, circuit.components[id], reducedNodeIds);
        }
    }

    addComponent(id, component, reducedNodeIds){
        switch(component.pins.length) {
            case 2:
                const [portA, portB] = component.pins.map((nodeId) => nodeId.toString());
                const {type, value} = component;
                this.addEdge(id, reducedNodeIds[portA], reducedNodeIds[portB], {type: type, value: value});
                break;
            case 4: 
                this.addFourPinComponent(id, component, reducedNodeIds);
                break;
            default:
                throw new Error("Unknown component");
        }
    }

    addFourPinComponent(id, component, reducedNodeIds){
        const [portA, portB, portC, portD] = component.pins.map((nodeId) => nodeId.toString());
        const {type, value} = component;
        this.addEdge(`${id}:2`, reducedNodeIds[portB], reducedNodeIds[portD], {
            type: type,
            value: value,
            meter: `${id}:1`
        });
        switch (component.type) {
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
                throw new Error("Unknown 4 pin component type");
        }
    }


    /**
     * Group nodes of a circuit that are connected (directly or indirectly) via a line
     * @param {any} circuit - The graphical circuit
     * @returns {Set<Set<any>>} nodeGroups - A set of node groups
     */
    static getNodeGroups(circuit) {
        const nodeGroups = new Set(Object.keys(circuit.pins).map((nodeId) => new Set([Number(nodeId)])));

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
