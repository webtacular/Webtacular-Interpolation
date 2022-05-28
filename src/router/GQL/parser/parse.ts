import { merge } from "../../../merge";
import { IOutput } from "../../../lexer/index.interfaces";

import leaf from "./leaf";
import root from "./root";

import schemaObject from "../../../lexer/types/objects/object";
import translate from "./translate";

export type IStringObject = { [x: string]: string | input };

export class input {
    gql: IStringObject
    key: string
    name: string
    schemaName: string

    constructor(gql: IStringObject, key: string, schemaName: string, name: string) {
        this.key = key;
        this.gql = gql;
        this.schemaName = schemaName;
        this.name = name;
    }
}

export interface IGql {
    [x: string]: IStringObject;
}

const loop = (obj: { [x:string]: schemaObject.init }): Array<string> => {
    const keys = Object.keys(obj);

    let returnable: string[] = [];

    for(let i: number = 0; i < keys.length; i++) {
        const key = keys[i],
            value = obj[key];

        returnable.push(value.root);
    }

    return returnable;
}

function parser(input: IOutput): string {
    // Variable to store the output in
    let gql: IGql = {};

    // Merge the leafs and the root
    merge(gql, root(input.processed.object));
    merge(gql, root(input.processed.nested));
    merge(gql, leaf(input.processed.values));

    const queryNames: string[] = loop(input.processed.object);

    return translate(gql, queryNames);
}

export default parser;
