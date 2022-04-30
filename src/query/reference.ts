import SchemaObject from './object';

namespace SchemaReference {


    export interface Constructor {
        commonKey?: string;
    }

    export class init {
        options: Constructor;
        reference: SchemaObject.init;


        constructor(options: Constructor, reference: SchemaObject.init) {
            this.options = options;
            this.reference = reference;
        }

    }
}

export default SchemaReference;