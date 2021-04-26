function updateValue(id) {
    controller.updateValue(id);
}

function drawLine(id, createNewNode) {
    controller.drawLine(id, createNewNode);
}

function startComponentMove(id) {
    controller.startComponentMove(id);
}

function stopMove() {
    controller.stopMove();
}

function handleNode(id) {
    controller.handleNode(id);
}

function ignoreEvent(event) {
    event.preventDefault()
}
