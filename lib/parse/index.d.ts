import SchemaObject from "../object";
import SchemaValue from "../value";
export interface Output {
    unique: Array<SchemaValue.init>;
    origin: SchemaObject.init;
    root: {
        [key: string]: string | boolean | number | {};
    };
    filter: Array<{
        func: (input: any, data: any) => boolean;
        input: SchemaValue.type;
        data: SchemaValue.type;
        name: string;
    }>;
}
export declare class Group {
    name: string;
    schema: {
        [key: string]: string | boolean | number | {};
    };
    constructor(name: string, schema: {
        [key: string]: string | boolean | number | {};
    });
}
declare const func: (Obj: SchemaObject.init) => Output;
export default func;
