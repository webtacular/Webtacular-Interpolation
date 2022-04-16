import Object from "./src/query/object";
import Value from "./src/query/value";
import { Construct } from "./src/";

const test: Construct.Schema = {
    user: new Object.init({
        collectionName: 'users',
        databaseName: 'test',
        collectionize: true,
        key: 'user',
    }, {
        user_name: new Value.init({
            type: 'string',
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

const schema = new Construct.load({
    connectionString: ''
}, test); 