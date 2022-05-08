import HookFunction from "./hook";
import _ from "lodash";

export interface groupHooksInterface {
    hook: HookFunction.hook,
    type: HookFunction.accessControlHooks,
    opts: HookFunction.HookOptions,
    identifier: string,
    keys: Array<string>
}

export interface groupHooks {
    [key: string]: groupHooksInterface,
}

export function groupHooks(hookBank: groupHooks, hooks: HookFunction.hookMap, identifier: string): {
    hookBank: groupHooks,
    hookIdentifiers: Array<string>
} {
    let newHookBank: groupHooks = hookBank,
        hookIdentifiers: Array<string> = [];

    for(let i = 0; i < hooks.length; i++) {
        const hook = hooks[i];

        // Check if the hook is already in the bank
        const bankKeys = Object.keys(newHookBank);

        let index: string | undefined = undefined;

        for(let j = 0; j < bankKeys.length; j++) {
            const bankHook = newHookBank[bankKeys[j]];

            // Compare the hook options
            if(_.isMatch(bankHook.opts, hook.hook.opts) !== true) continue;

            // Compare the hook type
            if(bankHook.type !== hook.type) continue;

            // Compare the function
            if(bankHook.hook.toString() !== hook.hook.toString()) continue;

            // If we get here, we have a match
            index = bankKeys[j];

            break;
        }

        // If we dont have a match, add the hook
        if(index === undefined) {
            const hookIdentifier: string = 'HOOK-' + (Date.now() * Math.random()).toString()
            
            // Set the hook
            Object.assign(newHookBank, { [hookIdentifier]: {
                identifier: hookIdentifier,
                hook: hook.hook,
                type: hook.type,
                opts: hook.hook.opts,
                keys: [identifier],
            } as groupHooksInterface });

            // Add the hook identifier
            hookIdentifiers.push(hookIdentifier);
        }

        // If we have a match, add the key
        else {
            if(newHookBank[index].keys.includes(identifier)) continue;

            newHookBank[index].keys.push(identifier);

            hookIdentifiers.push(index);
        }
    }

    return {
        hookBank: newHookBank,
        hookIdentifiers,
    };
}