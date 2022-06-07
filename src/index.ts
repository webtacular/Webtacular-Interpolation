import schemaObject from './lexer/types/objects/object';
import mongoService from './router/GQL/resolver/request/mongoDB/main';
import resolve from './router/GQL/resolver/main';

import hotQL from 'fastify-hotql';
import fastify, { FastifyInstance } from 'fastify';
import lexer from './lexer';
import parser from './router/GQL/parser';

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
                    const parsed = lexer(value);

                    // Create the schema
                    const schmea = parser(parsed);

                    // Create the resovler for the schemaObject
                    resolve(
                        parsed, 
                        schmea,
                        main, 
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
