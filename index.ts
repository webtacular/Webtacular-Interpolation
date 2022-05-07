import Object from './src/graphQL/schema/object';
import Value from './src/graphQL/schema/value';
import Reference from './src/graphQL/schema/reference';

import { Construct } from './src/';
// import SchemaFunction from './src/graphQL/resolver/src/accessControl/funcExec';


const userSchema = new Object.init({
    collectionName: 'users',
    databaseName: 'test',
    collectionize: true,
}, {
    user_name: new Value.init({
        type: 'string',
    }),

    email: new Value.init({
        type: 'string',
        accessControl: (hook) => {
            hook('view', (req) => {
                req.allow();
                
            });
        }
    }),

    password: new Value.init({
        type: 'string',
    }),

    language: new Value.init({
        type: 'string',
    }),

    profile_picture: new Value.init({
        type: 'string',
    }),

    id: new Value.init({
        type: 'id',
        unique: true,
        mask: {
            '_id': 1,
        }
    }),

    rare: new Value.init({
        type: 'string',
        description: 'The rare of the user',
    }),
});

const tokenSchema = new Object.init({
    collectionName: 'tokens',
    databaseName: 'test',
    collectionize: true,
}, {
    token: new Value.init({
        type: 'string',
        unique: true,
    }),

    user_id: new Reference.init({}, userSchema),
});

const schema = new Construct.load({
    connectionString: 'mongodb+srv://fsdatabase:s8LXxtCIPnkoKZct@devdb.rxkbh.mongodb.net/test?authSource=admin&replicaSet=atlas-lmizic-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true'
}, {
    user: userSchema,
    token: tokenSchema,
}); 

schema.start();