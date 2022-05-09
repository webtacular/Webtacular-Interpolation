import { projectionInterface } from '../graphQL/resolver/database/parseQuery';
import { groupHooksInterface } from './groupHooks';
import HookFunction from './hook';

export type hookInput = HookFunction.hookRequest & {
    hook: groupHooksInterface;
}

// Process all the preRequest hooks
function preHookProjectionArray(input: hookInput): Promise<projectionInterface> {
    return new Promise(async(resolve) => {
        // Get the hook function
        const hookFunc = input.hook.hook;

        // Execute the hook
        const hookReturn = await hookFunc.execute(input);

        switch(hookReturn) {
            case true:
                resolve({ $project: input.hook.preMask.allow });
                break;

            case false:
                resolve({ $project: input.hook.preMask.block });
                break;

            default:
                switch(input.hook.hook.opts.fallback) {
                    case 'allow':
                        resolve({ $project: input.hook.preMask.allow });
                        break;

                    case 'block':
                        resolve({ $project: input.hook.preMask.block });
                        break;
                }
                break;
        }
    });
}

export default preHookProjectionArray;