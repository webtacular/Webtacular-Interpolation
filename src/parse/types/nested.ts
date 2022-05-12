import schemaValue from './value';
import { types } from '../../types';

namespace schemaNested {
    export interface ValueInterface {
        [key: string]: schemaValue.init | schemaNested.init;
    }

    export interface Constructor {
        array?: boolean;
        inherit?: boolean;
        collectionize?: boolean;
        database?: {
            type: types.database;
            authentication: types.databaseConnection; 
        }
    }

    export class init {
        obj: ValueInterface;

        options: Constructor;

        identifier: string;

        parent: string;

        parents: string[];

        uniqueValues: Array<string> = [];

        constructor(options: Constructor, obj: ValueInterface) {
            // Perform a few checks to make sure that the options are valid
            
            // [1] You can't have both an array and collectionize
            if(options.array === true && options.collectionize === true)
                throw new Error('You can\'t have both an array and collectionize');

            // [2] You can't have a database and inherit defined
            if(options?.database && options.inherit === true)
                throw new Error('You can\'t have a database and inherit defined');
        
            // Set the options
            this.options = options;

            // Set the object
            this.obj = obj;

            this.uniqueValues = [];

            this.parents = [];
        }
    }
}

export default schemaNested;
