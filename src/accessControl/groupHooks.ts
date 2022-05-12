import HookFunction from "./hook";
import _ from "lodash";
import schemaValue from "../parse/types/value";
import { projectionInterface } from "../graphQL/resolver/database/parseQuery";
import { arrayToObject } from "../general";
import { ObjectId } from "mongodb";
import { merge } from "../merge";

export interface groupHooksInterface {
    hook: HookFunction.hook,
    type: HookFunction.accessControlHooks,
    opts: HookFunction.HookOptions,
    identifier: string,
    preMask?: {
        allow: projectionInterface;
        block: projectionInterface;
    }
    execution: HookFunction.hookExecution;
    keys: Array<string>
}

export interface groupHooks {
    [key: string]: groupHooksInterface,
}

export function groupHooks(hookBank: groupHooks, hooks: HookFunction.init, value: schemaValue.init): {
    hookBank: groupHooks,
    hookIdentifiers: Array<string>
} {
    let newHookBank: groupHooks = hookBank,
        hookIdentifiers: Array<string> = [];

    for(let i = 0; i < hooks.hooks.length; i++) {
        const hook = hooks.hooks[i];

        // Check if the hook is already in the bank
        const bankKeys = Object.keys(hookBank);

        let index: string | undefined = undefined;

        for(let j = 0; j < bankKeys.length; j++) {
            const bankHook = hookBank[bankKeys[j]];

            // Compare the hook options
            if(_.isMatch(bankHook.opts, hook.hook.opts) !== true) continue;

            // Compare the hook type
            if(bankHook.type !== hook.type) continue;

            // Compare the function
            if(bankHook.hook.request.toString() !== hook.hook.request.toString()) continue;

            // If we get here, we have a match
            index = bankKeys[j];

            break;
        }

        // If we dont have a match, add the hook
        if(index === undefined) {
            const hookIdentifier: string = new ObjectId().toString();
            
            // Set the hook
            Object.assign(newHookBank, { [hookIdentifier]: {
                identifier: hookIdentifier,
                hook: hook.hook,
                type: hook.type,
                opts: hook.hook.opts,
                keys: [value.identifier],
                preMask: {
                    allow: arrayToObject(value.mask.database.maskArray, 1),
                    block: arrayToObject(value.mask.database.maskArray, 0),
                },
                execution: hook.hook.opts.execution,
            } as groupHooksInterface });

            // Add the hook identifier
            hookIdentifiers.push(hookIdentifier);
        }

        // If we have a match, add the key
        else {
            if(newHookBank[index].keys.includes(value.identifier)) continue;

            newHookBank[index].keys.push(value.identifier);

            if(newHookBank[index].execution === 'preRequest') {
                newHookBank[index].preMask.allow = 
                    merge(newHookBank[index].preMask.allow, arrayToObject(value.mask.database.maskArray, 1)
                );

                newHookBank[index].preMask.block = 
                    merge(newHookBank[index].preMask.block, arrayToObject(value.mask.database.maskArray, 0)
                );
            }

            hookIdentifiers.push(index);
        }
    }

    return {
        hookBank: newHookBank,
        hookIdentifiers,
    };
}