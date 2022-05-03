"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schemaValue;
(function (schemaValue) {
    class init {
        constructor(opt) {
            this.options = opt;
        }
        setKey(name) {
            this.key = name;
        }
        setMask(obj) {
            this.mask = obj;
        }
        setObjectMaskObject(obj) {
            this.maskObject = obj;
        }
        setObjectMaskArray(arr) {
            this.maskArray = arr;
        }
    }
    schemaValue.init = init;
})(schemaValue || (schemaValue = {}));
exports.default = schemaValue;
//# sourceMappingURL=index.js.map