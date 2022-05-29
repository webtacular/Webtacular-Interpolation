import { IGraphQL } from "./src/types";
import { merge } from "../../../merge";
import { IOutput } from "../../../lexer/index.interfaces";

import leaf from "./src/leaf";
import root from "./src/root";

import schemaObject from "../../../lexer/types/objects/object";
import translate from "./src/translate";

// This function just extracts the keys of the root Query
const loop = (obj: { [x:string]: schemaObject.init }): Array<string> => {
    const keys = Object.keys(obj);

    // Temporary array to store the query names
    let returnable: string[] = [];

    // Loop trough the keys
    for(let i: number = 0; i < keys.length; i++) {
        const key = keys[i],
            value = obj[key];

        returnable.push(value.root);
    }

    return returnable;
}

function parser(input: IOutput): string {
    // Variable to store the output in
    let gql: IGraphQL = {};

    // Merge the leafs and the root
    merge(gql, root(input.processed.object));
    merge(gql, root(input.processed.nested));
    merge(gql, leaf(input.processed.values));

    return translate(gql, loop(input.processed.object));
}

export default parser;
