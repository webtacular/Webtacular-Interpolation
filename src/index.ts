import parse from './query/parse';
import SchemaObject from "./query/object";
import transpiler from './query/transpiler';
import MongoService from './resolve/src/database';
import resolve from './resolve';

import hotQL from 'fastify-hotql';
import fastify, { FastifyInstance } from "fastify";

export namespace Construct {
    export interface Schema {
        [key: string]: SchemaObject.init;
    }

    export interface Options {
        connectionString: string;
    }
    
    
    const main = async(main: load) => {
        // Wait for the database to be ready
        await main.client.init();
        await main.app.listen(9090);

        console.log('Server running on port 9090');

        const recurse = (obj: Schema) => {
            for (const key in obj) {
                const value = obj[key];
                
                if(value instanceof SchemaObject.init) {
                    // Set the key
                    value.key = key;

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
                        main
                    );
                }
            }
        }
        
        recurse(main.schema);
    }

    export class load {
        schema: Schema;
        client: MongoService;

        gql: hotQL;
        app: FastifyInstance;

        constructor(opts: Options, schema: Schema) {
            this.schema = schema;

            this.client = new MongoService(opts.connectionString);

            this.app = fastify();
    
            this.gql = new hotQL(this.app, {
                prefix: '/graphql',
                
                // You can start graphiql by setting this to true
                // PS: The paramaters below are optional
                graphiql: true,

                graphiql_prefix: '/graphql/explore',
            });
        }

        start() {
            main(this);
        }
    }
}
