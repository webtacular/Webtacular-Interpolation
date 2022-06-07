import individualResolve from './root/mongoDB/individual';
import collectionResolve from './root/mongoDB/collection';
import parseQuery from './request/parseQuery';
import schemaObject from '../../../lexer/types/objects/object';
import mongoService from './request/mongoDB/main';     

import { Resolver } from './main.d';
import { merge } from '../../../merge';
import { IOutput } from '../../../lexer/index.interfaces';
import { Construct } from '../../..';
import { buildSchema } from 'graphql';


function resolver(root:any, args:any, context:any, info:any, rootObject: schemaObject.init, client: mongoService, parsed: IOutput) {

    // Parse the actual query
    const parsedQuery = parseQuery(context);

    // Variable to store the output in
    let returnable: any = {};


    // These are the arguments that the user has passed in
    const argumentsObject = parsedQuery.arguments[rootObject.root],
        // These are the arguments that the user has passed in
        projectionObject = parsedQuery.projection[rootObject.root];

    switch(rootObject.collectionize) {
        case true: 
            const schema = rootObject.collectionizeFields.schema;

            const requestDetails: Resolver.IRequest = {
                collectionName: schema.collectionName,
                individualName: schema.individualName,

                projection: projectionObject,
                arguments: argumentsObject,

                filter: {},
                hookBank: parsed.hookBank,
            }        

            if(projectionObject[schema.individualName])
                returnable[schema.individualName] =
                    individualResolve(requestDetails, rootObject, client, context);

            if(projectionObject[schema.collectionName])
                returnable[schema.collectionName] = 
                    collectionResolve(requestDetails, rootObject, client, context);

            break;

        case false: 
            break;
    }

    return returnable;
}


function resolveOutput(parsed: IOutput, schema: string, main: Construct.load) {

    // Variable to store the resolver in
    let resolverObject = {};
    
    const rootKeys = Object.keys(parsed.processed.object);

    // Loop trough the root objects
    for(let i: number = 0; i < rootKeys.length; i++) {
        const key = rootKeys[i],
            value = parsed.processed.object[key];

        merge(resolverObject, {
            [value.root]: (root:any, args:any, context:any, info:any) => 
                resolver(root, args, context, info, value, main.client, parsed)
        });
    }

    // --------------------[ALL OF THIS IS TEMPORARY]-------------------- //
    main.gql.addSchema(buildSchema(schema), resolverObject);
    // --------------------[ALL OF THIS IS TEMPORARY]-------------------- //

    return resolverObject;
}

export default resolveOutput;