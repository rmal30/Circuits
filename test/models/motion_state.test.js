import assert from "assert"
import MotionState from "../../public/scripts/models/motion_state.js"
import { ELEMENT_TYPES } from "../../public/scripts/schematic/elements.js";

describe("Motion state", () => {
    
    let motionState;
    
    beforeEach(() => {
        motionState = new MotionState();
    });

    it("Constructor", () => {
        assert.strictEqual(motionState.moving, false);
        assert.strictEqual(motionState.id, null);
        assert.strictEqual(motionState.type, null);
    });

    it("Component move", () => {
        motionState.startComponentMove(1);
        assert.deepStrictEqual(motionState.moving, true);
        assert.deepStrictEqual(motionState.id, 1);
        assert.deepStrictEqual(motionState.type, ELEMENT_TYPES.IMAGE);
    });

    it("Node move", () => {
        motionState.startNodeMove(3);
        assert.deepStrictEqual(motionState.moving, true);
        assert.deepStrictEqual(motionState.id, 3);
        assert.deepStrictEqual(motionState.type, ELEMENT_TYPES.PIN);
    });

    it("No move", () => {
        motionState.startNodeMove(3);
        motionState.stopMove();
        assert.deepStrictEqual(motionState.moving, false);
        assert.deepStrictEqual(motionState.id, null);
        assert.deepStrictEqual(motionState.type, null);
    });
});