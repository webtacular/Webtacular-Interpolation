namespace SchemaValue { 
    export type type = 'string' | 'number' | 'float' | 'boolean' | 'id';

    export interface ValueConstructor {
        key?: string;
        unique?: boolean;
        description?: string;

        array?: boolean;
        mask?: {
            [key: string]: number | {}
        }

        type: type
    } 

    export class init {
        options: ValueConstructor;
        mask: {
            [key: string]: number | {}
        }
        key: string;
        maskObject: {
            [key: string]: number | {}
        };
        maskArray: Array<string>;

        constructor(opt: ValueConstructor) {
            this.options = opt;
        }

        setKey(name: string) {
            this.key = name;
        }

        setMask(obj: {
            [key: string]: number | {}
        }) {
            this.mask = obj;
        }

        setObjectMaskObject(obj: {
            [key: string]: number | {}
        }) {
            this.maskObject = obj;
        }

        setObjectMaskArray(arr: Array<string>) {
            this.maskArray = arr;
        }
    }
}

export default SchemaValue;