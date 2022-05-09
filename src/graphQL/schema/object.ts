import HookFunction from '../../accessControl/hook';
import schemaValue from './value';

namespace schemaObject {
    export interface ValueInterface {
        [key: string]: schemaValue.init;
    }
    
    export interface Constructor {
        collectionName: string;
        databaseName: string;
        collectionize?: boolean;
        page?: {
            maxSize?: number;
            defaultSize?: number;
        }
        description?: string;
        searchable?: boolean;
        accessControl?: HookFunction.accessControlFunc;
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
