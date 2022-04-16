"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Construct = void 0;
const parse_1 = __importDefault(require("./parse"));
const object_1 = __importDefault(require("./object"));
const transpiler_1 = __importDefault(require("./transpiler"));
var Construct;
(function (Construct) {
    const loop = (schema) => {
        const recurse = (obj) => {
            for (const key in obj) {
                const value = obj[key];
                if (value instanceof object_1.default.init) {
                    const parsed = (0, parse_1.default)(value);
                    const schmea = (0, transpiler_1.default)(parsed);
                    console.log(schmea.schema);
                }
            }
        };
        recurse(schema);
    };
    class load {
        constructor(schema) {
            this.schema = schema;
            loop(schema);
        }
    }
    Construct.load = load;
})(Construct = exports.Construct || (exports.Construct = {}));
//# sourceMappingURL=index.js.map