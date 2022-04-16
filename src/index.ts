import parse from './query/parse';
import SchemaObject from "./query/object";
import SchemaValue from "./query/value";
import transpiler from './query/transpiler';

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

                    //console.log(parsed, schmea);
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
