namespace SchemaValue { 
    export type type = 'string' | 'number' | 'float' | 'boolean' | 'id';
    export type GqlType = 'String' | 'Int' | 'Float' | 'Boolean' | 'ID' | '[String]' | '[Int]' | '[Float]' | '[Boolean]' | '[ID]';

    export interface ValueConstructor {
        // The name of the value
        key?: string;

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
        mask?: {
            [key: string]: number | {}
        }

        // The type of the value
        type: type
    } 

    export class init {
        // These are the options that are passed to the SchemaObject
        options: ValueConstructor;

        // This is the mask object used to fetch the data
        // from the database
        mask: { [key: string]: number | {} };

        // This is the key that will be used to access the value
        // Trough GraphQL.
        key: string;

        maskObject: { [key: string]: number | {} };

        // This is the array that was used to create the mask
        maskArray: Array<string>;


        constructor(opt: ValueConstructor) {
            this.options = opt;
        }
        

        setKey(name: string) {
            this.key = name;
        }

        setMask(obj: { [key: string]: number | {} }) {
            this.mask = obj;
        }

        setObjectMaskObject(obj: { [key: string]: number | {} }) {
            this.maskObject = obj;
        }

        setObjectMaskArray(arr: Array<string>) {
            this.maskArray = arr;
        }
    }
}

export default SchemaValue;