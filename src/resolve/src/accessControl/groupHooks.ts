import schemaValue from '../../../query/value';
import SchemaFunction from './funcExec';

export interface groupHooksInterface {
    hook: SchemaFunction.hook,
    details: Array<{
        type: SchemaFunction.accessControlHooks,
        value: schemaValue.init
    }>
}

export type groupedHookType = Array<groupHooksInterface>

const groupByFunction = (input: SchemaFunction.hookMap): groupedHookType => {
    let hookList: groupedHookType = [];

    // Go through each hook
    for(const hook of input) {

        // Check if the function is already in the list
        // This is the only way that I found that works, sorry.
        const index: number = hookList.findIndex(
            (item) => item.hook.request.toString() === hook.hook.request.toString()
        );

        // If the function is not in the list
        if(index === -1) hookList.push({
            hook: hook.hook,
            details: [{
                type: hook.type,
                value: hook.value
            }]
        });

        // Add the hook to the list
        else hookList[index].details.push({
            type: hook.type,
            value: hook.value
        });
    }

    // return the lis
    return hookList;
}

export default groupByFunction;