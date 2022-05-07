import _ from 'lodash';
import { arrayToObject } from '../../../../general';
import { projectionInterface } from '../database/parseQuery';
import SchemaFunction from './funcExec';
import { groupHooksInterface } from './groupHooks';

async function execGroupedHook(hook: groupHooksInterface, request: SchemaFunction.hookRequest): Promise<projectionInterface> {
    const func = hook.hook.request;

    let pass: boolean = hook.hook.opts.default === 'block' ? false : true;

    // Generate the response object
    const allow = () => pass = true,
        block = () => pass = false,
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