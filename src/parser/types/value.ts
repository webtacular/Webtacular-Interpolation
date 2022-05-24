import { merge } from 'lodash';
import { ObjectId } from 'mongodb';
import { hookReference } from '..';
import HookFunction from '../../accessControl/hook';
import { FilterObject } from '../../graphQL/schema/types';

namespace schemaValue { 
    export type type = 'string' | 'number' | 'float' | 'boolean' | 'id';
    export type GqlType = 'String' | 'Int' | 'Float' | 'Boolean' | 'ID' | '[String]' | '[Int]' | '[Float]' | '[Boolean]' | '[ID]';
    export type TsType = string | number | Float64Array | boolean | string[] | number[] | Float64Array[] | boolean[];

    export interface Constructor {
        // Is this value unique?
        unique?: boolean;

        // The description of the value
        description?: string;

        // Is this value an array?
        array?: boolean;

        // This allows the user to provide a custom
        // mask for the value. eg if the key in the schema
        // is 'id', the mask will be { 'id': 1 }
        // but the key in the database is '_id'
        // So we can pass in a custom mask to the value
        // to allow for this.
        mask?: { [key: string]: number | {} }

        // Collection name
        collectionName?: string;

        // Database name
        databaseName?: string;

        // The type of the value
        type: type;

        accessControl?: HookFunction.accessControlFunc;
    } 

    export class init {
        // These are the options that are passed to the schemaObject
        options: Constructor;

        mask: {
            schema: {
                // This is the mask object used to fetch the data
                // from the database
                mask: { [key: string]: number | {} };

                // This is the array that was used to create the mask
                maskArray: Array<string>;

                // This is the key that will be used to access the value
                // Trough GraphQL.
                key: string;
            }
            database: {
                mask: { [key: string]: number | {} };
                
                maskArray: Array<string>;

                key: string;
            }
        }

        additionalValues: Array<{
            key: string;
            value: any;
        }> = [];

        identifier = new ObjectId();

        hooks: Array<hookReference> = [];
        
        filters: { [x: string]: FilterObject; } = {};

        key: string = '';

        constructor(options: Constructor) {
            this.additionalValues = [];
            
            this.options = merge({
                unique: false,
                description: '',
                array: false,
                mask: {},
                collectionName: '',
                databaseName: '',
                type: 'string',
            }, options);

            this.mask = {
                schema: {
                    mask: {},
                    maskArray: [],
                    key: '',
                },
                database: {
                    mask: {},
                    maskArray: [],
                    key: '',
                }  
            }
        }
    }
}

export default schemaValue;