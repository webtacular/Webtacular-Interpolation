import { parse, processedObject } from '../';
import { Output } from "..";
import schemaNested from "../types/nested";
import schemaObject from "../types/object";
import schemaValue from "../types/value";
import { merge } from 'lodash';

const a = parse(new schemaObject.init({
    collectionName: 'config',
    databaseName: 'test',
    name: 'config',
    collectionize: true,
}, {
    id: new schemaValue.init({
        type: 'id',
        unique: true,

        mask: {
            schema: {  '_id': 1, }
        },
    }),

    values: new schemaNested.init({
        collectionize: true,
    }, {
        idNested: new schemaValue.init({
            type: 'id',
            unique: true,
        }),

        valueNested: new schemaValue.init({
            type: 'string',
            unique: true,
        }),
    }),

    precedence: new schemaValue.init({
        type: 'id',
        array: true,
    }),
}));

function formatNameArray(nameArray: Array<string>): string {
    let returnable: string = '';

    for (let i = 0; i < nameArray.length; i++) {
        let temp: string = nameArray[i].toLowerCase();
        
        // return if its the first word
        if(i === 0) returnable += temp;
        
        // capitalize first letter
        if(i > 0) returnable += temp.charAt(0).toUpperCase() + temp.slice(1);
    }

    return returnable;
}

function graphQL(input: Output) {
    let object: {
        [key: string]: {
            [key: string]: string;
        }
    } = {};

    const values: {
        [key: string]: processedObject;
    } = input.processed.values;

    const valueKeys: string[] = Object.keys(values);

    for (let i = 0; i < valueKeys.length; i++) {
        // Get the value
        const value = values[valueKeys[i]],
            parent =
                input.processed.object[value.parent] ?? 
                input.processed.nested[value.parent];
        
        // List of all the parents names
        let nameArray: string[] = [parent.key];

        // Check if we are a nested object
        if(parent instanceof schemaNested.init) {

            // Keys of the parents
            const parentsKeys = Object.keys(parent.parents);

            // Loop through the parents
            for (let i = parentsKeys.length - 1; i > -1; i--) {
                // If the value is the last one, skip it
                if(i === parentsKeys.length - 1) continue;

                // Get the parent
                const parent = 
                    input.processed.nested[value.parents[i]] ?? 
                    input.processed.object[value.parents[i]];

                // Add the parent to the name array
                nameArray.push(parent.key);
            }

            const parentParent = 
                input.processed.object[parent.parent] ?? input.processed.nested[parent.parent];

            // Add self to nested value
            merge(object, {
                [(parentParent as schemaObject.init).options.name]: {
                    [nameArray[0]]: formatNameArray(nameArray)
                }
            });
                
        }

        // Formated name
        const name = formatNameArray(nameArray);

        Object.keys(value.values).forEach((value) => {
            // Get the value
            const valueObject = (values[valueKeys[i]] as any).values[value];
            
            // Add the value to the object
            merge(object, {
                [name]: {
                    [valueObject.mask.schema.key]: valueObject.options.type,
                }
            });
        });
    }

    console.log(JSON.stringify(object, null, 2));
}

graphQL(a);