import Object from "./src/object";
import Value from "./src/value";
import { Construct } from "./src/";

const test: Construct.Schema = {
    user: new Object.init({
        collection: 'users',
        searchable: true,
        key: 'user',
    }, {
        name: new Value.init({
            type: 'string',
            array: true,
            description: 'The name of the user',
        }),

        id: new Value.init({
            type: 'id',
            unique: true,
            mask: {
                '_id': 1,
            }
        }),
    })
}

const schema = new Construct.load(test); 