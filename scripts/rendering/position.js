// Position class
class Position {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    show() {
        return this.x + " " + this.y;
    }

    coords() {
        return [this.x, this.y];
    }

    offset(x, y) {
        const pos = new Position(this.x, this.y);
        pos.x += x;
        pos.y += y;
        return pos;
    }
}
