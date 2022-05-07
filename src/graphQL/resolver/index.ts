import schemaObject from '../schema/object';

import parseQuery, { argumentsInterface, projectionInterface } from './src/database/parseQuery';
import { buildSchema } from 'graphql';
import { FilterObject } from '../schema/types';

import schemaValue from '../schema/value';

import individualResolve from './src/resolvers/mongoDB/individual';
import collectionResolve from './src/resolvers/mongoDB/collection';

import _ from 'lodash';
import { Construct } from '../..';
import { Context } from 'apollo-server-core';
import { types } from '../../types';

export interface requestDetails {
    collectionName: string;
    individualName: string;

    projection: projectionInterface;
    arguments: argumentsInterface

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
    const resolver: {
        [x: string]: (
            root: undefined,
            args: Record<string, unknown>,
            context: Context,
        ) => types.obj
    } = {
        [input.key]: (root, args, context) => {
            // Parse the query
            const parsedQuery = parseQuery(context);

            // This object will be used to store the response objects
            const returnObject: types.obj = {};

            // These are the arguments that the user has passed in,
            // the projection.
            const argument: argumentsInterface = parsedQuery.arguments[input.key] as argumentsInterface,
                projection: projectionInterface = parsedQuery.projection[input.key] as projectionInterface;

            // This object contains basic information about the schemaObject
            const requestDetails: requestDetails = {
                collectionName: (input.key + 'Collection'),
                individualName: input.key,

                projection: projection,
                arguments: argument,

                filter: filter
            }

            const rootKeys: string[] = Object.keys(parsedQuery.projection);

            // For each requested root key
            rootKeys.forEach((key: string) => {

                // Check if a root value is requested
                if(key === requestDetails.individualName) _.merge(returnObject, {
                    [key]: individualResolve(input, requestDetails, main.client, context)});
                
                // Check if the requested value is a collection
                else if(key === requestDetails.collectionName) _.merge(returnObject, {
                    [key]: collectionResolve(input, requestDetails, main.client, context)});

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