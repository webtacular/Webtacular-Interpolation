import schemaObject from "./object";
export declare namespace Construct {
    interface Schema {
        [key: string]: schemaObject.init;
    }
    class load {
        schema: Schema;
        constructor(schema: Schema);
    }
}
