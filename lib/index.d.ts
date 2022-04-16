import SchemaObject from "./object";
export declare namespace Construct {
    interface Schema {
        [key: string]: SchemaObject.init;
    }
    class load {
        schema: Schema;
        constructor(schema: Schema);
    }
}
