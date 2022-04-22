import SchemaObject from "../query/object";

import hotQL from 'fastify-hotql';
import fastify from "fastify";
import filterDetails from "./src/database/filter";

import { buildSchema } from 'graphql';
import { Filter } from "../query/parse";
import SchemaValue from "../query/value";

import rootResolve from "./src/root";
import MongoService from "./src/database";
import _ from "lodash";

export default (
    input: SchemaObject.init, 
    filter: Filter, 
    schema: string, 
    uniqueValues: SchemaValue.init[], 
    client: MongoService
) => {
    //     
    // 
    // We need a better way to do this, but for now this will do.
    // Once we start cleaning up the code, we can change this.
    // 
    //     
    let resolver = {
        [input.options.key]: (root:any, args:any, context:any, info:any) => {
            let argsFilter = filterDetails(context),
                returnObject = {};

            argsFilter.arguments = argsFilter.arguments[input.options.key];
            argsFilter.filter = argsFilter.filter[input.options.key];

            // This object contains basic information about the SchemaObject
            const SchemaDetails = {
                collectionName: input.options.key + 'Collection',
                rootName: input.options.key,
                filterName: input.options.key + 'Filter',
                filter: argsFilter.filter,
            }

            const rootKeys: string[] = Object.keys(argsFilter.filter);

            rootKeys.forEach((key) => {
                // Check if a root value is requested
                if(SchemaDetails.rootName === key) {
                    _.merge(returnObject, {
                        [key]: rootResolve(uniqueValues,
                            input, 
                            argsFilter.filter, 
                            argsFilter.arguments, 
                            client
                        )
                    });
                }
            });

            // Finaly, return the data to the user
            return returnObject;
        }
    };

    // --------------------[ALL OF THIS IS TEMPORARY]-------------------- //
    // This is just a temporary solution to test the schema and resolver  //
    const app = fastify();
    
    const gql = new hotQL(app, {
        prefix: '/graphql',
      
        // You can start graphiql by setting this to true
        // PS: The paramaters below are optional
        graphiql: true,

        graphiql_prefix: '/graphql/explore',
    });

    app.listen(9090).then(() => {
        console.log(`server listening on http://localhost:9090`);
    });

    gql.addSchema(buildSchema(`
        type Query {
            ${input.options.key}: ${input.options.key}Query
        }
        ${schema}
    `), resolver);
    // --------------------[ALL OF THIS IS TEMPORARY]-------------------- //
}