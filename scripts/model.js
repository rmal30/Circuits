class Model {
    constructor() {
        this.circuit = new Circuit(60, [], [], []);
        this.moving = {comp: false, dot: false};
        this.selected = {comp: false, node: false, line: false};
        this.pinCount = 0;
        this.moveID = null;
        this.prevPointID = null;
        this.selectID = null;
        this.pointExists = false;
    }
}
