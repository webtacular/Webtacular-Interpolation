import SchemaValue from "../../../query/value";
import { ProjectionInterface } from "../database/parseQuery";
import _ from "lodash";

namespace SchemaFunction {

    // This here interface is what will be
    // returned to the user(developer) when
    // they hook into the access control functions
    export interface Func {
        request: {
            // Url params, pretty self explanatory
            urlParams: {
                // eg, www.example.com/gql?id=5
                // = { id: 5 }
                [key: string]: string;
            }

            // What value the user is trying to pass in, 
            // If any
            value: SchemaValue.TsType | undefined;

            // A projection of the entire request
            projection: {
                // PreSchema: It will return the projection map
                // before we have parsed it and applied any masks
                preSchema: ProjectionInterface

                // PostSchema: It will return the projection map 
                // that is sent to the database.
                postSchema: ProjectionInterface
            }
        }

        // Undecided for now
        getRef: (key: string) => SchemaValue.TsType | undefined;

        // If this function is envoked, it means that the request
        // Will be honored, and the user will be able to access
        // the data.
        allow: () => void;

        // If this function is envoked, it means that the request
        // Will be denied, and the user will not be able to access
        // the data.
        block: () => void;
    }

    export interface HookOptions { 
        preRequest?: boolean,
        default?: 'allow' | 'block',
    }

    // This type contains all the different types of hooks that
    // the developer can use
    export type accessControlHooks = 'view' | 'edit' | 'create' | 'delete';

    // This is the hook function, it is whats given to the 
    // developer by the accessControlFunc function
    export type hookFunc = (hook: accessControlHooks, request: (request: Func) => void, opts?: HookOptions) => void;

    // This is the access control function that can be accessed
    // by the SchemaObject parameters or the SchemaObject parameters
    export type accessControlFunc = (hook: hookFunc) => void;

    // Default configuration for hooks
    const defaultHookOpts: HookOptions = {
        preRequest: true,
        default: 'block'
    }

    export class init {
        hooks: Map<accessControlHooks, {
            function: (request: Func) => void,
            opts?: HookOptions
        }> = new Map();

        constructor(accessControl: accessControlFunc) {
            // Lets unpack the access control function
            accessControl((hook, request, opts) => {
                this.hooks.set(hook, {
                    function: request,
                    opts: _.merge(defaultHookOpts, opts)
                });
            });
        }
    }
}

export default SchemaFunction;