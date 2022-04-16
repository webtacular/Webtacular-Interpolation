"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SchemaObject;
(function (SchemaObject) {
    class init {
        constructor(options, obj) {
            this.options = options;
            this.obj = obj;
        }
        setKey(name) {
            this.key = name;
        }
    }
    SchemaObject.init = init;
})(SchemaObject || (SchemaObject = {}));
exports.default = SchemaObject;
//# sourceMappingURL=index.js.map