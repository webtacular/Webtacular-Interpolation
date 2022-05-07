//
//
// This here file maps the context from Appolo-GraphQL-Server to something that we can work with.
// It outputs a projection object that can be used to query the database (after its remapped), and
// an arguments object that contains the arguments that the user has passed in.
//
//

import { Context } from 'apollo-server-core';
import _ from 'lodash';
import { arrayToObject } from '../../../../general';
import { types } from '../../../../types';
import parseArgs from './parseArgs';

// --- These two interfaces need to strongly typed --- //
export type projectionInterface = {
    [key: string]: number | { [x: string]: projectionInterface }
}

export type argumentsInterface = types.obj;
// -------------------------------------------------- //

export default (context: Context): {
    projection: projectionInterface,
    arguments: argumentsInterface
} => {
    const projection: projectionInterface = {};
    const args: argumentsInterface = {};

    const recurse = (selection: types.obj, parentName: string[] = []): void => {
        
        for(const newSelection in Object.keys(selection)) {
            // Current selection
            const current = selection[newSelection] as types.obj;

            // If the current selection is a field
            if(current?.kind === 'Field') {
                // -----------------[ Value ]----------------- //
                const name: string | undefined = (current.name as types.obj)?.value as string ?? undefined;

                // If the current selection name is not null
                if(!name) continue;

                // If the parent name is not undefined
                if(parentName[0] !== undefined)
                    _.merge(projection, arrayToObject(parentName, {[name]: 1}));
                
    
                // If the parent name is null,
                // then merge the projection with the current selection
                else _.merge(projection, {[name]: 1});
                // -----------------[ Value ]----------------- //


                // -----------------[ Args ]----------------- //
                _.merge(args, arrayToObject(parentName, parseArgs(current)));
                // -----------------[ Args ]----------------- //
            }

            // If the current selection is an array, we need to recurse
            // Lovely typescript here, I know, dont worry about it, just 
            // look away. ill fix it later.
            if((current?.selectionSet as types.obj)?.selections)
                recurse((current?.selectionSet as types.obj)?.selections as types.obj, [...parentName, (current.name as types.obj)?.value as string]);
        }
    }

    // Start the recursive function
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    recurse(context.operation.selectionSet.selections);

    // Finally return the projection
    return {
        projection,
        arguments: args
    };
}