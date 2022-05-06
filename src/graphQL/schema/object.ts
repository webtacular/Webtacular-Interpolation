import SchemaReference from './reference';
import SchemaFunction from '../resolver/src/accessControl/funcExec';
import schemaValue from './value';

namespace schemaObject {
    export interface ValueInterface {
        [key: string]: schemaValue.init | SchemaReference.init;
    }
    
    export interface Constructor {
        collectionName: string;
        databaseName: string;
        collectionize?: boolean;
        description?: string;
        searchable?: boolean;
        accessControl?: SchemaFunction.accessControlFunc;
    }

    export class init {
        options: Constructor;
        obj: ValueInterface;
        key: string;
        
        maskArray: string[] = [];
        mask: { [key: string]: number | {} } = {};

        constructor(options: Constructor, obj: ValueInterface) {
            this.options = options;
            this.obj = obj;
        }

        setKey(name: string) {
            this.key = name;
        }
    }
}

export default schemaObject;
