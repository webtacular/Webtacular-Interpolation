import schemaObject from './object';

namespace SchemaReference {


    export interface Constructor {
        commonKey?: string;
    }

    export class init {
        options: Constructor;
        reference: schemaObject.init;


        constructor(options: Constructor, reference: schemaObject.init) {
            this.options = options;
            this.reference = reference;
        }

    }
}

export default SchemaReference;