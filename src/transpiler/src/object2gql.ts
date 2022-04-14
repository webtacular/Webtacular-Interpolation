type precurser = 'type' | 'interface' | 'input';

import { Group } from "../../parse";

export default (
    object: { [key: string]: string | number | boolean | {} }, 
    input: { [key: string]: string | number | boolean | {} }, 

    name: string, precurser: precurser): string => {

    // Prepare the output
    let gql: Array<string> = [],
        inputGql: Array<string> = [];

    // Loop through the input
    Object.keys(object).forEach(key => 
        gql.push(`${key}: ${object[key]}`));

    // Format the input
    Object.keys(input).forEach(key =>
        inputGql.push(`${key}: ${input[key]}`));

    let Input: string = '';
    if(inputGql.length > 0) 
        Input = ` (${inputGql.join(', ')})`;

    // Return the output
    return `${precurser} ${name}${Input} {${gql.join(', ')}}`;
}