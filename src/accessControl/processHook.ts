import { projectionInterface } from '../router/GQL/resolver/request/parseQuery';
import { groupHooksInterface } from './groupHooks';
import HookFunction from './hook';

export type hookInput = HookFunction.hookRequest & {
    hook: groupHooksInterface;
}

// Process all the preRequest hooks
function execPreHook(input: hookInput): Promise<projectionInterface> {
    return new Promise(async(resolve) => {
        // Get the hook function
        const hookFunc = input.hook.hook;

        // Execute the hook
        const hookReturn = await hookFunc.execute(input);

        // Do we allow or block the request?
        switch(hookReturn) {
            case true: resolve(input.hook.preMask.allow); break;
            case false: resolve(input.hook.preMask.block); break;

            default:
                switch(input.hook.hook.opts.fallback) {
                    case 'allow': resolve(input.hook.preMask.allow); break;
                    case 'block': resolve(input.hook.preMask.block); break;
                }
                break;
        }
    });
}

export default execPreHook;