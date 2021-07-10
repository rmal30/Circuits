// Prompt value from user
export default class PromptView {
    constructor (_window) {
        this.window = _window;
    }
    
    promptComponentValue(info) {
        const promptStr = `Please enter a ${info.prop} for a ${info.name} in ${info.unit}`;
        let value = null;
        let invalid = true;
        do {
            value = this.window.prompt(promptStr);
            invalid = value === "";
            if (invalid) {
                this.window.alert("Please enter a valid value");
            }
        } while (invalid);
        return value;
    }
}