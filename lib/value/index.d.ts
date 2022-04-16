declare namespace SchemaValue {
    type type = 'string' | 'number' | 'float' | 'boolean' | 'id';
    interface ValueConstructor {
        key?: string;
        unique?: boolean;
        description?: string;
        array?: boolean;
        mask?: {
            [key: string]: number | {};
        };
        type: type;
    }
    class init {
        options: ValueConstructor;
        mask: {
            [key: string]: number | {};
        };
        key: string;
        maskObject: {
            [key: string]: number | {};
        };
        maskArray: Array<string>;
        constructor(opt: ValueConstructor);
        setKey(name: string): void;
        setMask(obj: {
            [key: string]: number | {};
        }): void;
        setObjectMaskObject(obj: {
            [key: string]: number | {};
        }): void;
        setObjectMaskArray(arr: Array<string>): void;
    }
}
export default SchemaValue;
