/**
 * Generate network graph from graphical circuit
 * @param {any} circuit - The graphical circuit
 * @returns {Graph} graph - Network graph representation of the circuit
 */
function generateGraphFromCircuit(circuit) {
    const graph = new Graph();
    for (let i = 0; i < circuit.pins.length; i++) {
        if (Object.keys(circuit.pins[i]).length > 0) {
            graph.addNode(i);
        }
    }

    for (const index in circuit.lines) {
        if (circuit.lines[index]) {
            const [node1, node2] = circuit.lines[index].split("_");
            const lineID = `${COMPONENT_TYPES.LINE}-${index}`;
            graph.addEdge(lineID, [parseInt(node1, 10), parseInt(node2, 10)]);
        }
    }

    let count = 0;
    for (const component of circuit.components) {
        if (Object.keys(component).length > 0) {
            const edgeID = `${component.type}-${component.id}`;
            if (component.pins.length === 2) {
                graph.addEdge(edgeID, component.pins);
            } else {
                const [portA, portB, portC, portD] = component.pins;
                graph.addEdge(edgeID, [portB, portD]);
                if (CURRENT_CONTROLLED_SOURCES.includes(component.type)) {
                    const lineID = `${COMPONENT_TYPES.LINE}-${circuit.lines.length + count}`;
                    graph.addEdge(lineID, [portA, portC]);
                    count++;
                }
            }
        }
    }

    return graph;
}
