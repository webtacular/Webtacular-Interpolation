"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SchemaValue;
(function (SchemaValue) {
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
    SchemaValue.init = init;
})(SchemaValue || (SchemaValue = {}));
exports.default = SchemaValue;
//# sourceMappingURL=index.js.map