import assert from 'assert';
import SelectionState from "../../public/scripts/models/selection_state.js";
import { ELEMENT_TYPES } from '../../public/scripts/schematic/elements.js';

describe("Selection state", () => {
    
    let selectionState;
    
    beforeEach(() => {
        selectionState = new SelectionState();
    });

    it("Constructor", () => {
        assert.strictEqual(selectionState.selected, false);
        assert.strictEqual(selectionState.id, null);
        assert.strictEqual(selectionState.type, null);
    });

    it("Component selection", () => {
        selectionState.selectImage(1);
        assert.deepStrictEqual(selectionState.selected, true);
        assert.deepStrictEqual(selectionState.id, 1);
        assert.deepStrictEqual(selectionState.type, ELEMENT_TYPES.IMAGE);
    });

    it("Node selection", () => {
        selectionState.selectPin(3);
        assert.deepStrictEqual(selectionState.selected, true);
        assert.deepStrictEqual(selectionState.id, 3);
        assert.deepStrictEqual(selectionState.type, ELEMENT_TYPES.PIN);
    });

    it("Line selection", () => {
        selectionState.selectLine(4);
        assert.deepStrictEqual(selectionState.selected, true);
        assert.deepStrictEqual(selectionState.id, 4);
        assert.deepStrictEqual(selectionState.type, ELEMENT_TYPES.LINE);
    });

    it("No selection", () => {
        selectionState.selectImage(3);
        selectionState.clearSelection();
        assert.deepStrictEqual(selectionState.selected, false);
        assert.deepStrictEqual(selectionState.id, null);
        assert.deepStrictEqual(selectionState.type, null);
    });
});