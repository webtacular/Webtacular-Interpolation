import { ObjectId } from 'mongodb';
import { IValFilter } from '../../filters';
import { IProcessedValue, IValueReference } from '../../index.interfaces';

import schemaValue from '../value';
import schemaNested from './nested';
import HookFunction from '../../../accessControl/hook';
import collectionize from '../collections';

namespace baseObject {
    export interface ValueInterface {
        [key: string]: schemaValue.init | schemaNested.init;
    }
    
    export interface Constructor {
        array?: boolean;

        collectionize?: boolean;
        collectionizeFields?: {
            name?: string;
            individualName?: string;
        }

        page?: {
            maxSize?: number;
            defaultSize?: number;
        }

        description?: string;
        searchable?: boolean;
        accessControl?: HookFunction.accessControlFunc;
    }

    export type TSchemaValueObject = { [key: string]: () => schemaValue.init };
    export type TDatabaseValueObject = TSchemaValueObject;

    export class init {
        options: Constructor;

        schemaValueMap: TSchemaValueObject = {};
        databaseValueMap: TSchemaValueObject = {};

        obj: ValueInterface

        collectionize: boolean = false;

        collectionizeFields: {
            schema: {
                collectionName: string;
                individualName: string;
            },
            types: {
                collectionName: string;
                individualName: string;
            },
        }

        key: string;

        array: boolean = false;

        root: string;

        identifier = new ObjectId();

        uniqueValues: Array<IValueReference> = []; 

        maskArray: string[] = [];

        mask: Array<string> = [];

        filters: Array<IValFilter> = [];

        childGetter: () => IProcessedValue;

        childIdentifier = new ObjectId();

        constructor(options: Constructor) {
            // [1] You can't have both an array and collectionize
            if(options.array === true && options.collectionize === true)
                throw new Error('You can\'t have both an array and collectionize');

            // Check if collectionize is set
            if(options.collectionize === true)
                this.collectionize = true;

            // Check of tje collection is an array
            if(options.array === true)
                this.array = true;
        }

        setKey(key: string) {
            // set the key
            this.key = key;

            // set the root 
            this.root = `${key}Parent`;
        }

        collectionizeObject(key?: string) {
            if(key) this.setKey(key);

            // Check if the object is collectionize
            if(this.options.collectionize === true) {

                // Set the collectionize flag
                this.collectionize = true;
                
                // collectionize
                collectionize(this);
            }
        }

        verifyObject(): void {
            // Are we a collection?
            if(this.collectionize === true) {
                // Do we have unique values?
                if(this.uniqueValues.length === 0)
                    throw new Error('You must have unique values for a collection');
            }
        }

        
    }
}

export default baseObject;