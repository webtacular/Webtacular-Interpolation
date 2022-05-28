import { IGql, input } from "./parse";

// This finall function will be used to translate the object into valid GQL
function translate(gql: IGql, queryMask: Array<string>): string {

    let returnable: string = '',
        queryString: string = 'type Query {';

    const rawKeys: Array<string> = Object.keys(gql);

    for (let i: number = 0; i < rawKeys.length; i++) {
        
        const key = rawKeys[i],
            parent = gql[key],
            parentKeys: Array<string> = Object.keys(parent);

        // Check if the value is in queryMask
        if (queryMask.includes(key))
            queryString += `${key}: ${key},`;

        let parentReturnable: string =  `type ${key} { `;

        for (let j: number = 0; j < parentKeys.length; j++) {
            const childKey = parentKeys[j], //            Name
                childValue = parent[childKey]; // Type

            if (childValue instanceof input) {
                returnable += `input ${childValue.name} { `;

                const inputKeys: Array<string> = Object.keys(childValue.gql);

                for (let k: number = 0; k < inputKeys.length; k++) {
                    const inputKey = inputKeys[k],
                        inputValue = childValue.gql[inputKey];

                    if(k === inputKeys.length - 1)
                        returnable += `${inputKey}: ${inputValue} } \n`;

                    else returnable += `${inputKey}: ${inputValue}, `;
                }

                parentReturnable += `${childKey}(${childValue.schemaName}: ${childValue.name}): ${childValue.key}, `;
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

    return returnable + `\n ${queryString} }`;
}

export default translate;