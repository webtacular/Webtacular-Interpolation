import { merge } from '../../../merge';
import { types } from '../../../types';

import baseObject from './base';

namespace schemaObject {

    export interface Constructor extends baseObject.Constructor {
        name: string;
        databaseName: string;
        database?: {
            type: types.database;
            authentication: types.databaseConnection; 
        }
    }

    export class init extends baseObject.init {
        options: Constructor;

        constructor(options: Constructor, obj: baseObject.ValueInterface) {
            super(options);

            this.options = options;

            this.obj = obj;
            
            this.uniqueValues = [];

            // Set the key
            this.key = options.name || options.name;
        }

        clearObject() {
            this.obj = {};
        }
    }
}

export default schemaObject;
