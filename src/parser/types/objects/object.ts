import { types } from '../../../types';

import collectionize from '../../src/collections';
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

            // Check if the object is collectionize
            if(this.options.collectionize === true) {

                // Set the collectionize flag
                this.collectionize = true;
                
                // collectionize
                collectionize(this);
            }

            // Set the key
            this.key = options.name || options.collectionName;
        }

        clearObject() {
            this.obj = {};
        }
    }
}

export default schemaObject;
