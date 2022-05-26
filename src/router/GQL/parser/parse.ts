import { parse } from "../../../lexer";
import { IOutput } from "../../../lexer/index.interfaces";

import schemaValue from "../../../lexer/types/value";
import schemaNested from "../../../lexer/types/objects/nested";
import schemaObject from "../../../lexer/types/objects/object";

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
        array: true,
    }, {
        ip: new schemaValue.init({
            type: 'string',
            description: 'The ip address of the user',
            mask: [ 'login_ip' ]
        }),

        loginDate: new schemaValue.init({
            type: 'string',
            description: 'The date of the login',
            mask: [ 'login_date' ]
        }),
    }),
}));

function parser(input: IOutput): void {

}

parser(schema);