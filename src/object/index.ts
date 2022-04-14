import Value from '../value';

namespace SchemaObject {
    export interface ValueInterface {
        [key: string]: Value.init | SchemaObject.init;
    }
    
    export interface Constructor {
        key: string;
        collection: string;
        description?: string;
        searchable?: boolean;
    }

    export class init {
        options: Constructor;
        obj: ValueInterface;
        key: string;

        constructor(options: Constructor, obj: ValueInterface) {
            this.options = options;
            this.obj = obj;
        }

        setKey(name: string) {
            this.key = name;
        }
    }
}

export default SchemaObject;
