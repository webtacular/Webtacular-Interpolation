import _ from 'lodash';
import { arrayToObject } from '../general';
import { projectionInterface } from '../graphQL/resolver/src/database/parseQuery';
import HookFunction from './hook';
import { groupHooksInterface } from './groupHooks';

async function execGroupedHook(hook: groupHooksInterface, request: HookFunction.hookRequest): Promise<projectionInterface> {
    const func = hook.hook.request;

    // Set the default access control to the one defined in the options
    let pass: boolean = hook.hook.opts.fallback === 'block' ? false : true;

    // Generate the response object
    const allow = (): boolean => pass = true,
        block = (): boolean => pass = false,
        getRef = (key: string) => '';

    // Await all the hook 
    await Promise.all([func({
        request,
        allow,
        block,
        getRef,
    })]);

    // depending on if the hook was allowed or blocked
    // construct the projection, false = block | 0, true = allow | 1
    if(pass === true) return {};

    // Variable to hold the projection
    const projectionObject: projectionInterface = {};

    // Create the projection object and merge them
    for(let i = 0; i < hook.details.length; i++) {
        _.merge(projectionObject, arrayToObject(hook.details[i].value.maskArray, 0));
    }

    // Return the projection
    return projectionObject;
}

export default execGroupedHook;