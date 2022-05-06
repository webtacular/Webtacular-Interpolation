import _ from 'lodash';
import { arrayToObject } from '../../general';

import schemaObject from './object';
import schemaValue from './value';

import { FilterObject, TypeMap } from './types';

export interface Output {
    unique: Array<schemaValue.init>;
    origin: schemaObject.init;
    root: { [key: string]: string | boolean | number | {}; };
    filter: {[x: string]: FilterObject};
}

export class Group {
    name: string;
    schema: { [key: string]: string | boolean | number | {}; };

    constructor(name: string, schema: { [key: string]: string | boolean | number | {}; }) {
        this.name = name;
        this.schema = schema;
    }
}

const func = (Obj: schemaObject.init): Output => {
    let opts = {
        uniqueValue: false,
        uniqueValues: [] as Array<schemaValue.init>,
        collectionize: Obj.options?.collectionize ?? false,
    }

    let graphQL: Output = {
        root: {},
        filter: {},
        unique: [] as Array<schemaValue.init>,
        origin: Obj
    };

    const recurse = (obj: schemaObject.ValueInterface, parentNames: string[] = []) => {
        
        for (const key in obj) {
            const value = obj[key];

            if (value instanceof schemaValue.init) {

                // Check if we have a unique value
                // This is important as if the schemaObject
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

                const gqlType = TypeMap[value.options.type];

                // Set the name of the value
                value.key = key;

                // Check if value options contain a mask
                if(value.options.mask) {
                    value.mask = value.options.mask;

                    // We need to grab the furthest child in the object
                    const maskRecurse = (obj: {[x: string]: number | {}}, maskArray: Array<string> = []) => {
                        for (const key in obj) {

                            const value = obj[key];

                            maskArray.push(key);

                            if (value instanceof Object) maskRecurse(value, maskArray);
                        }

                        return maskArray;
                    }

                    // Set the mask array
                    value.maskArray = maskRecurse(value.options.mask);
                }

                // If not, generate a mask based on the schemaObject
                else {
                    value.mask = arrayToObject([...parentNames, key])

                    // Set the maskArray
                    value.maskArray = [...parentNames, key];
                }
  

                // ----[ Root ]---- //
                // Merge the object
                _.merge(graphQL.root, [...parentNames, null].reduceRight((obj: {}, next : string | null):  { [x: string]: {} }  => {

                    if(next === null) {
                        // Format the type to fit the schema
                        let formatedType = gqlType.gql + (value.options?.unique ? '!' : '');

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
                Object.keys(gqlType.filter).forEach(filterName => 
                    graphQL.filter[key + filterName] = { 
                        actualKey: value.maskArray[value.maskArray.length - 1], 
                        schemaKey: key,
                        ...gqlType.filter[filterName] 
                });

            }

            // If the value is an schemaObject, recurse
            if (value instanceof schemaObject.init) 
                recurse(value.obj, [...parentNames, key]);
        }
    }

    // [ Entry ] //
    recurse(Obj.obj);

    // Check if this schemaObject is a searchable collection
    if(opts.collectionize === false) 
        // Check if we have the required unique values
        if(opts.uniqueValue === false)
            throw new Error('schemaObjects must have a unique value, or be a collection');

    // Loop through all the unique values
    opts.uniqueValues.forEach(value => {
        graphQL.unique.push(value);
    });

    // Return the graphQL object
    return graphQL;
}

export default func;