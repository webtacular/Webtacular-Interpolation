import _ from 'lodash';

import SchemaFunction from './funcExec';

import { arrayToObject } from '../../../../general';
import { projectionInterface } from '../database/parseQuery';
import { groupHooksInterface } from './groupHooks';

const execGroupedHook = async(hook: groupHooksInterface, request: SchemaFunction.hookRequest): Promise<projectionInterface> => {
    const func = hook.hook.request;

    let pass: boolean = hook.hook.opts.default === 'block' ? false : true;

    // Generate the response object
    const allow = () => pass = true,
        block = () => pass = false,
        getRef = (key: string) => {
            return key
        };

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
    hook.details.forEach(val => _.merge(projectionObject, arrayToObject(val.value.maskArray, 0)));

    // Return the projection
    return projectionObject;
}

export default execGroupedHook;