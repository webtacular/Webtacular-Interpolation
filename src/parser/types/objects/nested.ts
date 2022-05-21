import { Reference } from '../..';

import collectionize from '../../src/collections';
import baseObject from './base';

namespace schemaNested {
    export interface Constructor extends baseObject.Constructor {
        inherit?: boolean;
    }

    export class init extends baseObject.init {
        parent: Reference;
        parents: Array<Reference> = [];

        constructor(options: Constructor, obj: baseObject.ValueInterface) {
            super(options);
        
            // Set the options
            this.options = options;

            // Set the object
            this.obj = obj;

            this.uniqueValues = [];

            this.parents = [];
        }

        clearObject() {
            this.obj = {};
        }

        collectionizeObject(key: string) {
            // set the key
            this.key = key;

            // Check if the object is collectionize
            if(this.options.collectionize === true) {

                // Set the collectionize flag
                this.collectionize = true;
                
                // collectionize
                collectionize(this);
            }
        }
    }
}

export default schemaNested;
