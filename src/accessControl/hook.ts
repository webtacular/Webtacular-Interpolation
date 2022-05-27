import schemaValue from '../lexer/types/value';

import { merge } from '../merge';
import { internalConfiguration } from '../general';
import { projectionInterface } from '../router/GQL/resolver/database/parseQuery';

namespace HookFunction {

    export interface hookRequest {
        // Url params, pretty self explanatory
        params: {
            // eg, www.example.com/gql?id=5
            // = { id: 5 }
            [key: string]: string;
        }

        headers: {
            [key: string]: string;
        }

        // What value the user is trying to pass in, 
        // If any
        value?: schemaValue.TsType | undefined;

        // A projection of the entire request
        projection: {
            // PreSchema: It will return the projection map
            // before we have parsed it and applied any masks
            preSchema: projectionInterface

            // PostSchema: It will return the projection map 
            // that is sent to the database.
            postSchema: projectionInterface
        }
    }

    // This here interface is what will be
    // returned to the user(developer) when
    // they hook into the access control functions
    export interface Func {
        request: hookRequest;

        // Undecided for now
        getRef: (key: string) => schemaValue.TsType | undefined;

        // If this function is envoked, it means that the request
        // Will be honored, and the user will be able to access
        // the data.
        allow: () => true;

        // If this function is envoked, it means that the request
        // Will be denied, and the user will not be able to access
        // the data.
        block: () => false;

        // This function allows the user to set the page size
        // for the collection
        setMaxPageSize: (pageSize: number) => void;

        setDefPageSize: (pageSize: number) => void;
    }

    export type hookAccessControl = 'allow' | 'block';
    export type hookExecution = 'preRequest' | 'postRequest';

    export interface HookOptions { 
        fallback?: hookAccessControl,
        execution?: hookExecution,
    }

    // This type contains all the different types of hooks that
    // the developer can use
    export type accessControlHooks = 'view' | 'edit' | 'create' | 'delete';

    // This is the hook function, it is whats given to the 
    // developer by the accessControlFunc function
    export type hookFunc = (hook: accessControlHooks, request: (request: Func) => boolean | Promise<boolean>, opts?: HookOptions) => void;

    // This is the access control function that can be accessed
    // by the schemaObject parameters or the schemaObject parameters
    export type accessControlFunc = (hook: hookFunc) => void;

    export type hookObject = {
        hook: hook,
        type: accessControlHooks,
    }

    export interface hookPasstrhough {
        maxPageSize?: number;
        defPageSize?: number;
    }

    export type hookMap = Array<hookObject>;

    // Default configuration for hooks
    const defaultHookOpts: HookOptions = {
        fallback: internalConfiguration.hooks.defualtAccessControl,
        execution: internalConfiguration.hooks.defaultExecution,
    }

    export class hook {
        hook: accessControlHooks;
        request: (request: Func) => boolean | Promise<boolean>;
        opts: HookOptions;
        passThrough: hookPasstrhough = {}

        constructor(
            request: (request: Func) => boolean | Promise<boolean>,
            opts?: HookOptions
        ) {
            this.request = request;
            this.opts = merge(defaultHookOpts, opts);
        }

        execute(request: hookRequest): boolean | Promise<boolean> {
            return this.request({
                request,

                getRef: (key: string) => '',
                allow: () => true,
                block: () => false,
                setMaxPageSize: (number) => this.passThrough.maxPageSize = number,
                setDefPageSize: (number) => this.passThrough.defPageSize = number,
            });
        }
    }

    export class init {
        hooks: hookMap = [];

        constructor(
            accessControl: accessControlFunc,
        ) {
            accessControl((hookType, request, opts) => {
                this.hooks.push({
                    hook: new hook(request, opts),
                    type: hookType,
                });
            });
        }
    }
}

export default HookFunction;