// Position class
class Position {

    constructor(x, y) {
        this.x = x;
        this.y = y;
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
