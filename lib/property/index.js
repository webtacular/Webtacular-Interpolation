"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const value_1 = __importDefault(require("../value"));
var Property;
(function (Property) {
    class init {
        constructor(options) {
            this.options = options;
        }
    }
    Property.init = init;
})(Property || (Property = {}));
const test = new Property.init({
    type: [
        new value_1.default('string'),
        new value_1.default('array<string>'),
        new value_1.default('object<string, number>'),
    ],
});
exports.default = Property;
// This regual expression is to match the following:
// - object<type>
// - object<type, otherType, ThisCanBeWhatever>
// The text between the <> is the type, the type can be /[a-zA-Z0-9]+/
// The types are separated by commas, there has to be at least one type
// and no maxiumum number of types
//# sourceMappingURL=index.js.map