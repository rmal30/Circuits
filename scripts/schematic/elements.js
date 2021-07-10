export const ELEMENT_TYPES = {
    LABEL: "Label",
    IMAGE: "Image",
    LINE: "Line",
    PIN: "Pin"
};

export const ELEMENT_PREFIXES = {
    Line: "lin",
    Image: "img",
    Pin: "pin-",
    Label: "txt"
};

export function getElementId(id, type) {
    if (type in ELEMENT_PREFIXES) {
        return ELEMENT_PREFIXES[type] + id;
    } else {
        throw new Error("Invalid type");
    }
}