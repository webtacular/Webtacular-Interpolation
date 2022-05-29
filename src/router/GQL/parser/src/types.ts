import { merge } from "lodash";

export type IStringObject = { [x: string]: string | GQLinput | GQLvalue };

export interface IGraphQL { [root: string]: { [leaf: string]: string | GQLvalue } };

export interface IValueOpts {
    type: string;
    required?: boolean;
}

export class GQLvalue {
    options: IValueOpts;
    constructor(options: IValueOpts) {
        this.options = merge({
            required: false,
        }, options);
    }
}

export interface IInputVals {
    name: string;
    type: string;
    return: string;
}

export interface IInputOpts {
    required?: boolean;
}

export class GQLinput {
    gql: IStringObject;
    values: IInputVals;
    options: IInputOpts;

    constructor(gql: IStringObject, vals: IInputVals, opts?: IInputOpts) {
        this.gql = gql;
        
        this.options = merge({
            required: false,
        }, opts);

        this.values = vals
    }
}
