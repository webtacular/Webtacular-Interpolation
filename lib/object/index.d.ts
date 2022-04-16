import Value from '../value';
declare namespace SchemaObject {
    interface ValueInterface {
        [key: string]: Value.init | SchemaObject.init;
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
export default SchemaObject;
