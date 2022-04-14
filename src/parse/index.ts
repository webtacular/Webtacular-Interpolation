import _ from 'lodash';
import { arrayToObject } from '../general';

import SchemaObject from "../object";
import SchemaValue from "../value";

import { TypeMap } from "../value/src/types";

export interface Output {
    unique: Array<SchemaValue.init>;
    origin: SchemaObject.init;
    root: { [key: string]: string | boolean | number | {}; }
    filter: Array<{ func: (input: any, data: any) => boolean; input: SchemaValue.type; data: SchemaValue.type; name: string }>
}

export class Group {
    name: string;
    schema: { [key: string]: string | boolean | number | {}; };

    constructor(name: string, schema: { [key: string]: string | boolean | number | {}; }) {
        this.name = name;
        this.schema = schema;
    }
}

const func = (Obj: SchemaObject.init): Output => {
    let opts = {
        uniqueValue: true,
        uniqueValues: [] as Array<SchemaValue.init>,
        searchable: Obj.options?.searchable ?? false,
    }

    let graphQL: Output = {
        root: {},
        filter: [],
        unique: [] as Array<SchemaValue.init>,
        origin: Obj
    };

    const recurse = (obj: SchemaObject.ValueInterface, parentNames: string[] = []) => {
        for (const key in obj) {
            const value = obj[key];

            if (value instanceof SchemaValue.init) {

                // Check if we have a unique value
                // This is important as if the SchemaObject
                // is a collection, It needs to have a unique
                // value to be able to be queried.
                if(value.options.unique) {
                    opts.uniqueValue = true;

                    // Push the value to the uniqueValues array
                    opts.uniqueValues.push(value);
                }

                // Check if the Type is valid
                if(!TypeMap[value.options.type]) 
                    throw new Error(`Invalid Type: ${value.options.type}`);

                // Set the name of the value
                value.setKey(key);

                // Set the maskArray
                value.setObjectMaskArray([Obj.options.key, ...parentNames, key]);

                // Set the maskObject
                value.setObjectMaskObject(arrayToObject(value.maskArray));

                // Check if value options contain a mask
                if(value.options.mask) 
                    value.setMask(value.options.mask);

                // If not, generate a mask based on the SchemaObject
                else value.setMask(arrayToObject([...parentNames, key]));
  
                // ----[ Root ]---- //
                // Merge the object
                _.merge(graphQL.root, [...parentNames, null].reduceRight((obj: {}, next : string | null):  { [x: string]: {} }  => {

                    if(next === null) {
                        // Format the type to fit the schema
                        let formatedType = TypeMap[value.options.type].gql + (value.options?.unique ? '!' : '');

                        // Check if the value is an array
                        if(value.options.array === true) 
                            formatedType = `[${formatedType}]`;

                        // Finally return the object
                        return {
                            [key]: formatedType,
                            [key + 'Description']: 'Boolean',
                            [key + 'IsUnique']: 'Boolean',
                        };
                    }

                    else return ({[next]: obj});
                }, {})); 
            
                // ----[ Collection ]---- //

                Object.keys(TypeMap[value.options.type].filter).forEach(keyFilter => {
                    const func = TypeMap[value.options.type].filter[keyFilter];

                    const returnable: {
                            func: (input: any, data: any) => boolean;
                            input: SchemaValue.type;
                            data: SchemaValue.type;
                            name: string
                    } = {
                        func: func.func,
                        input: TypeMap[value.options.type].gql as SchemaValue.type,
                        data: value.options.type,
                        name: key + keyFilter
                    };

                    graphQL.filter.push(returnable);
                });

            }

            // If the value is an SchemaObject, recurse
            if (value instanceof SchemaObject.init) 
                recurse(value.obj, [...parentNames, key]);
        }
    }

    // [ Entry ] //
    recurse(Obj.obj);

    // Check if this SchemaObject is a searchable collection
    if(opts.searchable === true) 
        // And check if we have the required unique values
        if(opts.uniqueValue === false)
            throw new Error('Searchable SchemaObjects must have a unique value');

    // Loop through all the unique values
    opts.uniqueValues.forEach(value => {
        graphQL.unique.push(value);
    });

    // Return the graphQL object
    return graphQL;
}

export default func;