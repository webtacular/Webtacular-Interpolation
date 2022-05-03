import schemaObject from '../query/object';

import parseQuery, { ArgumentsInterface, projectionInterface } from './src/database/parseQuery';

import { buildSchema } from 'graphql';
import { FilterObject } from '../query/types';

import schemaValue from '../query/value';

import individualResolve from './src/rootResolvers/individual';
import collectionResolve from './src/rootResolvers/collection';

import mongoService from './src/database/mongo';
import _ from 'lodash';
import { Construct } from '..';

export interface requestDetails {
    collectionName: string;
    individualName: string;

    projection: projectionInterface;
    arguments: ArgumentsInterface

    filter: { [x: string]: FilterObject };
}

export default (
    input: schemaObject.init, 
    filter: { [x: string]: FilterObject }, 
    schema: string, 
    uniqueValues: schemaValue.init[], 
    main: Construct.load
) => {
    //     
    // 
    // We need a better way to do this, but for now this will do.
    // Once we start cleaning up the code, we can change this.
    // 
    //     
    let resolver = {
        [input.key]: (root:any, args:any, context:any, info:any) => {
            // Parse the query
            let parsedQuery = parseQuery(context),
                // This object will be used to store the response objects
                returnObject = {};

            // These are the arguments that the user has passed in
            parsedQuery.arguments = parsedQuery.arguments[input.key];

            // These are the arguments that the user has passed in
            parsedQuery.projection = parsedQuery.projection[input.key];

            // This object contains basic information about the schemaObject
            const requestDetails: requestDetails = {
                collectionName: (input.key + 'Collection'),
                individualName: input.key,

                projection: parsedQuery.projection,
                arguments: parsedQuery.arguments,

                filter: filter
            }

            const rootKeys: string[] = Object.keys(parsedQuery.projection);

            // For each requested root key
            rootKeys.forEach((key: string) => {

                // Check if a root value is requested
                if(key === requestDetails.individualName) {
                    _.merge(returnObject, {
                        [key]: individualResolve(
                            input, 
                            requestDetails,
                            main.client
                        )
                    });
                }

                // Check if the requested value is a collection
                if(key === requestDetails.collectionName) {
                    _.merge(returnObject, {
                        [key]: collectionResolve(
                            input, 
                            requestDetails,
                            main.client,
                            context
                        )
                    });
                }
            });

            // Finaly, return the data to the user
            return returnObject;
        }
    };


     // Get any parameters that were passed in by 
    // the url eg /users?limit=10 from the context

    // --------------------[ALL OF THIS IS TEMPORARY]-------------------- //
    main.gql.addSchema(buildSchema(`
        type Query {
            ${input.key}: ${input.key}Query
        }
        ${schema}
    `), resolver);
    // --------------------[ALL OF THIS IS TEMPORARY]-------------------- //
}