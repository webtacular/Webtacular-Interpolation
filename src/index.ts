import parse from './parse';
import SchemaObject from "./object";
import SchemaValue from "./value";
import transpiler from './transpiler';

export namespace Construct {
    export interface Schema {
        [key: string]: SchemaObject.init;
    }

    const loop = (schema: Schema) => {
        const recurse = (obj: Schema) => {
            for (const key in obj) {
                const value = obj[key];
                
                if(value instanceof SchemaObject.init) {
                    const parsed = parse(value);

                    const schmea = transpiler(parsed);

                    console.log(schmea.schema);
                }
            }
        }
        
        recurse(schema);
    }

    export class load {
        schema: Schema;

        constructor(schema: Schema) {
            this.schema = schema;

            loop(schema);
        }
    }
}
