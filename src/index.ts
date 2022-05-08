import parse from './graphQL/schema/parse';
import schemaObject from './graphQL/schema/object';
import transpiler from './graphQL/schema/transpiler';
import mongoService from './graphQL/resolver/src/database/mongoDB';
import resolve from './graphQL/resolver';

import hotQL from 'fastify-hotql';
import fastify, { FastifyInstance } from 'fastify';

export namespace Construct {
    export interface Schema {
        [key: string]: schemaObject.init;
    }

    export interface Options {
        connectionString: string;
    }
    
    async function main (main: load) {
        // Wait for the database to be ready
        await main.client.init();
        await main.app.listen(9090);

        console.log('Server running on port 9090');

        const recurse = (obj: Schema) => {
            for (const key in obj) {
                const value = obj[key];
                
                if(value instanceof schemaObject.init) {
                    // Set the key
                    value.key = key;

                    // Parse the schemaObject
                    const parsed = parse(value);

                    // Create the schema
                    const schmea = transpiler(parsed);

                    // Create the resovler for the schemaObject
                    resolve(
                        schmea.orgin, 
                        parsed,
                        schmea.schema, 
                        main
                    );
                }
            }
        }
        
        recurse(main.schema);
    }

    export class load {
        schema: Schema;
        client: mongoService;

        gql: hotQL;
        app: FastifyInstance;

        constructor(opts: Options, schema: Schema) {
            this.schema = schema;

            this.client = new mongoService(opts.connectionString);

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
