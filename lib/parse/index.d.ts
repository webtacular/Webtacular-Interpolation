import schemaObject from "../object";
import schemaValue from "../value";
export interface Output {
    unique: Array<schemaValue.init>;
    origin: schemaObject.init;
    root: {
        [key: string]: string | boolean | number | {};
    };
    filter: Array<{
        func: (input: any, data: any) => boolean;
        input: schemaValue.type;
        data: schemaValue.type;
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
declare const func: (Obj: schemaObject.init) => Output;
export default func;
