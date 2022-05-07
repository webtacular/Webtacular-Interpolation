import Value from '../value';
declare namespace schemaObject {
    interface ValueInterface {
        [key: string]: Value.init | schemaObject.init;
    }
    interface Constructor {
        key: string;
        collection: string;
        description?: string;
        searchable?: boolean;
    }
    class init {
        options: Constructor;
        obj: ValueInterface;
        key: string;
        constructor(options: Constructor, obj: ValueInterface);
        setKey(name: string): void;
    }
}
export default schemaObject;
