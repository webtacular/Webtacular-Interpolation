import parse from './query/parse';
import SchemaObject from "./query/object";
import SchemaValue from "./query/value";
import transpiler from './query/transpiler';
import MongoService from './resolve/src/database';
import resolve from './resolve';

export namespace Construct {
    export interface Schema {
        [key: string]: SchemaObject.init;
    }

    export interface Options {
        connectionString: string;
    }

    const main = async(schema: Schema, client: MongoService) => {
        // Wait for the database to be ready
        await client.init();

        const recurse = (obj: Schema) => {
            for (const key in obj) {
                const value = obj[key];
                
                if(value instanceof SchemaObject.init) {
                    // Parse the SchemaObject
                    const parsed = parse(value);

                    // Create the schema
                    const schmea = transpiler(parsed);

                    // Create the resovler for the SchemaObject
                    const resolver = resolve(
                        schmea.orgin, 
                        parsed.filter, 
                        schmea.schema, 
                        parsed.unique,
                        client
                    );

                    console.log(schmea.schema);
                }
            }
        }
        
        recurse(schema);
    }

    export class load {
        schema: Schema;
        client: MongoService;

        constructor(opts: Options, schema: Schema) {
            this.schema = schema;

            this.client = new MongoService(opts.connectionString);

            main(schema, this.client);
        }
    }
}
