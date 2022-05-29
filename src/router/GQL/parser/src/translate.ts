import { IGraphQL, GQLinput, GQLvalue } from "./types";

function ifNotLast(i: number, l: number, ifVar: string, elseVar: string): string {
    return i === l - 1 ? elseVar : ifVar;
}

// Processes the input class and returns valid GQL string
function inputParser(input: GQLinput): string {
    // Temporary string to store the returnable
    let returnableString: string = `input ${input.values.type} { `;
    
    // Loop trough all the values of the parent
    const parentKeys: Array<string> = Object.keys(input.gql);

    // Loop trough all the values of the parent
    for (let j: number = 0; j < parentKeys.length; j++) {
        const parentKey: string = parentKeys[j],
            parentValue = input.gql[parentKey];

        // If the value is a simple string, we dont need to do much
        if(typeof parentValue === 'string')
            returnableString += `${parentKey}: ${parentValue}${ifNotLast(j, parentKeys.length, ', ', ' }\n')}`;

        else if(parentValue instanceof GQLvalue) {
            // prepare the string for the value
            let constructorString: string = `${parentKey}: `;

            // Check if the value is required
            if(parentValue.options.required === true)
                constructorString += `${parentValue.options.type}!`;

            // cap the string
            constructorString += ifNotLast(j, parentKeys.length, ', ', ' }\n');

            // add the string to the returnable string
            returnableString += constructorString;
        }
    }

    // Return the string
    return returnableString;
}

// This finall function will be used to translate the object into valid GQL
function translate(gql: IGraphQL, queryMask: Array<string>): string {
    let returnable: string = '',
        queryString: string = 'type Query { ',
        queryCount = 0;

    const rawKeys: Array<string> = Object.keys(gql);

    for (let i: number = 0; i < rawKeys.length; i++) {
        
        const key = rawKeys[i],
            parent = gql[key],
            parentKeys: Array<string> = Object.keys(parent);

        // Check if the value is in queryMask
        if (queryMask.includes(key))
            queryString += `${key}: ${key}${ifNotLast(queryCount++, queryMask.length, ', ', ' }\n')}`;

        let parentReturnable: string =  `type ${key} { `;

        // Loop trough all the values of the parent
        for (let j: number = 0; j < parentKeys.length; j++) {

            const childKey = parentKeys[j], // Name
                childValue = parent[childKey]; // Value

            // Check if the value has inputs
            if (childValue instanceof GQLinput) {
                returnable += inputParser(childValue);

                // Add the input to the parent returnable
                parentReturnable += `${childKey}(${childValue.values.name}: ${childValue.values.type}): ${childValue.values.return},`;
            }
            else {
                // Cap the sting off with a '}' if its the last item in the object
                if(j === parentKeys.length - 1)
                    parentReturnable += `${childKey}: ${childValue} }`;

                // If not, separate the items with a ','
                else parentReturnable += `${childKey}: ${childValue}, `;
            }
        }

        returnable += `${parentReturnable} \n`;
    }


    return returnable + `\n${queryString}`;
}

export default translate;