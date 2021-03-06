
import { merge } from '../../../merge';
import { IReference } from '../../index.interfaces';

import baseObject from './base';
import schemaObject from './object';

namespace schemaNested {
    export interface Constructor extends baseObject.Constructor {
        inherit?: boolean;
    }

    export class init extends baseObject.init {
        parent: IReference;
        parents: Array<IReference> = [];
        options: Constructor;

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

        setParents(parents: Array<schemaObject.init | schemaNested.init>) {
            // Set the parents
            for(let j: number = 0; j < parents.length; j++) {
                // Set the parent
                this.parents.push({
                    identifier: parents[j].identifier,
                    get: () => parents[j]
                });

                // If we are at the last parent 
                // Set the parent reference
                if(j === parents.length - 1) this.parent = {
                    identifier: parents[j].identifier,
                    get: () => parents[j]
                }
            }

            // set the mask
            this.mask = [...this.parent.get().mask, this.key];
        }
    }
}

export default schemaNested;
