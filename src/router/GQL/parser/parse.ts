import { parse } from "../../../lexer";
import { merge } from "../../../merge";
import { IOutput } from "../../../lexer/index.interfaces";

import leaf from "./leaf";
import root from "./root";

import schemaValue from "../../../lexer/types/value";
import schemaNested from "../../../lexer/types/objects/nested";
import schemaObject from "../../../lexer/types/objects/object";
import translate from "./translate";


const schema = parse(new schemaObject.init({
    collectionName: 'config',
    databaseName: 'test',
    name: 'config',
    collectionize: true,
}, {
    id: new schemaValue.init({
        type: 'id',
        unique: true,

        mask: [ '_id' ]
    }),

    userName: new schemaValue.init({
        type: 'string',
        unique: true,
    }),

    loginHistory: new schemaNested.init({
        collectionize: true,
        array: false,
    }, {
        ip: new schemaValue.init({
            type: 'string',
            description: 'The ip address of the user',
            mask: [ 'login_ip' ]
        }),

        loginDate: new schemaValue.init({
            type: 'string',
            unique: true,
            description: 'The date of the login',
            mask: [ 'login_date' ]
        }),
    }),
}));

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

function parser(input: IOutput): void {
    // Variable to store the output in
    let gql: IGql = {};

    // Merge the leafs and the root
    merge(gql, root(input.processed.object));
    merge(gql, root(input.processed.nested));
    merge(gql, leaf(input.processed.values));

    const queryNames: string[] = loop(input.processed.object);

    translate(gql, queryNames);
}

export default parser;

parser(schema);