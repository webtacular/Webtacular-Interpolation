import { Construct } from './src/';
import schemaNested from './src/lexer/types/objects/nested';
import schemaObject from './src/lexer/types/objects/object';
import schemaValue from './src/lexer/types/value';

const userSchema = new schemaObject.init({
    name: 'users',
    databaseName: 'test',
    collectionize: true,
}, {
    user_name: new schemaValue.init({
        type: 'string',
        accessControl: (hook) => {
            hook('view', (req) => {
                return false;
            });
        }     
    }),

    email: new schemaValue.init({
        type: 'string',
        accessControl: (hook) => {
            hook('view', (req) => {
                return false;
            });
        }   
    }),

    password: new schemaValue.init({
        type: 'string',
        accessControl: (hook) => {
            hook('view', (req) => {
                return false;
            });
        }   
    }),

    language: new schemaValue.init({
        type: 'string',
    }),

    profile_picture: new schemaValue.init({
        type: 'string',
    }),

    id: new schemaValue.init({
        type: 'id',
        unique: true,

        mask: ['_id'],
   
        accessControl: (hook) => {
            hook('view', (req) => {
                return false;
            }, { group: false });
        }  
    }),

    rare: new schemaValue.init({
        type: 'string',
        description: 'The rare of the user',
        accessControl: (hook) => {
            hook('view', (req) => {
                return false;
            }, { group: false });
        }  
    }),

    security_info: new schemaNested.init({}, {
        last_login: new schemaValue.init({
            type: 'number',
            description: 'The last login of the user',
        }),
    })
});


const schema = new Construct.load({
    // Changed the token, oops. 
    connectionString:
}, {
    user: userSchema,
}); 

schema.start();
