//
//
// This here file maps the context from Appolo-GraphQL-Server to something that we can work with.
// It outputs a projection object that can be used to query the database (after its remapped), and
// an arguments object that contains the arguments that the user has passed in.
//
//

import _ from 'lodash';
import { arrayToObject } from '../../../general';
import parseArgs from './parseArgs';

// --- These two interfaces need to strongly typed --- //
export interface projectionInterface {
    [key: string]: any
}

export interface ArgumentsInterface {
    [key: string]: any
}
// -------------------------------------------------- //

export type queryExport = {
    projection: projectionInterface,
    arguments: ArgumentsInterface
}

export default function(context:any): queryExport {
    let projection: projectionInterface = {};
    let args: ArgumentsInterface = {};

    const recurse = (selection:any, parentName:string[] = []): void => {
        
        for(const newSelection in Object.keys(selection)) {
            // Current selection
            const current: any = selection[newSelection];

            // If the current selection is a field
            if(current?.kind === 'Field') {
                // -----------------[ Value ]----------------- //
                // If the current selection name is not null
                if(current.name === null) continue;

                // If the parent name is not undefined
                if(parentName[0] !== undefined) {
                    // turn tje parentName array into an object
                    // eg [ 'hello', 'other' ], name => { hello: other: { name: 1 } }

                    // _.merge(projection, [...parentName, null].reduceRight((obj: {}, next : string | null):  { [x: string]: {}}  => {
                    //     if(next === null) return ({[current.name.value]: 1});

                    //     return ({[next]: obj});
                    // }, {})); 

                    _.merge(projection, arrayToObject(parentName, {[current.name.value]: 1}));
                }
                    
                // If the parent name is null,
                // then merge the projection with the current selection
                else _.merge(projection, {[current.name.value]: 1});
                // -----------------[ Value ]----------------- //


                // -----------------[ Args ]----------------- //
                _.merge(args, [...parentName].reduceRight((obj, next)  => {
                    const parsedArgs = parseArgs(current);
                    if(parsedArgs !== {}) return ({[next]: parsedArgs});
                }, {}));
                // -----------------[ Args ]----------------- //
            }

            // If the current selection is an array, we need to recurse
            if(current?.selectionSet?.selections)
                recurse(current.selectionSet.selections, [...parentName, current.name.value]);
        }
    }

    // Start the recursive function
    recurse(context.operation.selectionSet.selections);

    // Finally return the projection
    return {
        projection,
        arguments: args
    };
}