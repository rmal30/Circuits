function generateGraphFromCircuit(circuit) {
    const graph = new Graph();
    for (let i = 0; i < circuit.pins.length; i++) {
        if (Object.keys(circuit.pins[i]).length > 0) {
            graph.addNode(i);
        }
    }

    let edge;
    for (let i = 0; i < circuit.lines.length; i++) {
        if (circuit.lines[i]) {
            edge = circuit.lines[i].split("_");
            graph.addEdge(COMPONENT_TYPES.LINE + "-" + i, [parseInt(edge[0]), parseInt(edge[1])]);
        }
    }

    let count = 0;
    for (let i = 0; i < circuit.components.length; i++) {
        if (Object.keys(circuit.components[i]).length > 0) {
            edge = circuit.components[i];
            if (edge.pins.length == 2) {
                graph.addEdge(edge.type + "-" + edge.id, edge.pins);
            } else {
                graph.addEdge(edge.type + "-" + edge.id, [edge.pins[1], edge.pins[3]]);
                if (edge.type === COMPONENT_TYPES.CURRENT_CONTROLLED_CURRENT_SOURCE || edge.type === COMPONENT_TYPES.CURRENT_CONTROLLED_VOLTAGE_SOURCE) {
                    graph.addEdge(COMPONENT_TYPES.LINE + "-" + (lines.length + count), [edge.pins[0], edge.pins[2]]);
                    count++;
                }
            }
        }
    }
    return graph;
}