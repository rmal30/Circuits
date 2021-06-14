import Position from "../../public/scripts/rendering/position.js";
import assert from "assert";

describe("Position", () => {
    const x = 1;
    const y = 2;
    let pos;

    before(() => {
        pos = new Position(x, y);
    });

    it("Constructor", () => {
        assert.deepStrictEqual(pos.x, x);
        assert.deepStrictEqual(pos.y, y);
    });

    it("Show", () => {
        assert.strictEqual(pos.show(), "1 2");
    });

    it("Get coordinates as vector", () => {
        assert.deepStrictEqual(pos.coords(), [x, y]);
    });

    it("Offset function", () => {
        const dx = 3;
        const dy = 4;
        const newPos = pos.offset(dx, dy);
        assert.deepStrictEqual(newPos.x, x + dx);
        assert.deepStrictEqual(newPos.y, y + dy);
        assert.deepStrictEqual(pos.x, x);
        assert.deepStrictEqual(pos.y, y);
    });

});
