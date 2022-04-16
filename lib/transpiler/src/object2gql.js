"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputClass = void 0;
class InputClass {
    constructor(Input, Type) {
        this.Inputs = Input;
        this.Type = Type;
    }
}
exports.InputClass = InputClass;
exports.default = (object, name, precurser) => {
    // Prepare the output
    let gql = [];
    // Loop through the input
    Object.keys(object).forEach(key => {
        let inp = [], typeName = object[key], parameter = key;
        // Check if the object[key] is a Input instance
        if (object[key] instanceof InputClass) {
            const InputInstance = object[key];
            // Loop through the Input instance
            Object.keys(InputInstance.Inputs).forEach(key => {
                inp.push(`${key}: ${InputInstance.Inputs[key]}`);
            });
            // set the parameter
            parameter += `(${inp.join(', ')})`;
            // set the typeName to the type
            typeName = InputInstance.Type;
        }
        // push the key and the typeName
        gql.push(`${parameter}: ${typeName}`);
    });
    // Return the output
    return `${precurser} ${name} {${gql.join(', ')}}`;
};
//# sourceMappingURL=object2gql.js.map