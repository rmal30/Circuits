// Prompt value from user
export default class WindowView {
    constructor (_window) {
        this._window = _window;
    }

    promptUntilValid(promptStr) {
        let value = null;
        let invalid = true;
        do {
            value = this._window.prompt(promptStr);
            invalid = value === "";
            if (invalid) {
                this._window.alert("Please enter a valid value");
            }
        } while (invalid);
        return value;
    }
    
    promptComponentValue(info) {
        return this.promptUntilValid(`Please enter a ${info.prop} for a ${info.name} in ${info.unit}`);
    }

    promptCircuitName() {
        return this.promptUntilValid("Please enter a circuit name");
    }

    alertMessage(errorMessage) {
        this._window.alert(errorMessage);
    }
}