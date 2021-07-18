// Position class
export default class Position {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromObject(positionObject) {
        return new Position(positionObject.x, positionObject.y);
    }

    toObject() {
        return {x: this.x, y: this.y};
    }

    show() {
        return `${this.x} ${this.y}`;
    }

    coords() {
        return [this.x, this.y];
    }

    offset(x, y) {
        return new Position(this.x + x, this.y + y);
    }
}
