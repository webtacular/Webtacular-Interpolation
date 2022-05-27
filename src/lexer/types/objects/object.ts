import { types } from '../../../types';

import baseObject from './base';

namespace schemaObject {

    export interface Constructor extends baseObject.Constructor {
        collectionName: string;
        databaseName: string;
        database?: {
            type: types.database;
            authentication: types.databaseConnection; 
        }
    }

    export class init extends baseObject.init {

        constructor(options: Constructor, obj: baseObject.ValueInterface) {
            super(options);

            this.options = options;
            this.obj = obj;
            this.uniqueValues = [];

            // Set the key
            this.key = options.name || options.collectionName;
        }

        clearObject() {
            this.obj = {};
        }
    }
}

export default schemaObject;
