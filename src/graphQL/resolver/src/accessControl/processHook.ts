import { projectionInterface } from '../database/parseQuery';
import execGroupedHook from './execGroupedHook';
import SchemaFunction from './funcExec';
import { groupedHookType } from './groupHooks';

// Process all the preRequest hooks
function preHookProjectionArray(input: {
    hooks: groupedHookType,
    params:  {[key: string]: string;}
    cookies: {[key: string]: string;}
    headers: {[key: string]: string;}
    value?: any
    projection: {
        preSchema: projectionInterface,
        postSchema: projectionInterface
    }
}): Promise<Array<projectionInterface>> {
    return new Promise(async(resolve) => {
        // Promise array to store the projection promises
        let promiseArray: Array<Promise<projectionInterface>> = [];

        // Go through each preRequest hook and execute it
        for(let i = 0; i < input.hooks.length; i++) {
            const hooks = input.hooks[i];

            promiseArray.push(execGroupedHook(hooks, {
                urlParams: input.params,
                cookies: input.cookies,
                headers: input.headers,
    
                projection: {
                    preSchema: input.projection.preSchema,
                    postSchema: input.projection.postSchema,
                },
    
                value: input.value,
            }))
        }

        // Resolve the array of promises
        return resolve(await Promise.all(promiseArray) as Array<projectionInterface>);
    });
}

export default preHookProjectionArray;