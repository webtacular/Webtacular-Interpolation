import { projectionInterface } from '../database/parseQuery';
import { groupedHookType } from './groupHooks';

import execGroupedHook from './execGroupedHook';
import { types } from '../../../../types';

// Process all the preRequest hooks
const preHookProjectionArray = (input: {
    hooks: groupedHookType,
    params:  {[key: string]: string;}
    cookies: {[key: string]: string;}
    headers: {[key: string]: string;}
    value?: types.basicUnion
    projection: {
        preSchema: projectionInterface,
        postSchema: projectionInterface
    }
}): Promise<Array<projectionInterface>> => {
    return new Promise((resolve) => {
        // Promise array to store the projection promises
        const promiseArray: Array<Promise<projectionInterface>> = [];

        // Go through each preRequest hook and execute it
        input.hooks.forEach(async(hooks) => promiseArray.push(execGroupedHook(hooks, {
            urlParams: input.params,
            cookies: input.cookies,
            headers: input.headers,

            projection: {
                preSchema: input.projection.preSchema,
                postSchema: input.projection.postSchema,
            },

            value: input.value,
        })));

        // Resolve the array of promises
        resolve(Promise.all(promiseArray));
    });
}

export default preHookProjectionArray;