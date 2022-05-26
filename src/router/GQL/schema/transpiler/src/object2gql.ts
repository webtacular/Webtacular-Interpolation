type precurser = 'type' | 'interface' | 'input';

interface Inputs {
    [key: string]: string
}

export class InputClass {
    Inputs: Inputs;
    Type: string;

    constructor(Input: Inputs, Type: string){
        this.Inputs = Input;
        this.Type = Type;
    }
}

export default (
    object: { [key: string]: string | number | boolean | InputClass | {} }, 
    name: string, precurser: precurser): string => {

    // Prepare the output
    let gql: Array<string> = [];

    // Loop through the input
    Object.keys(object).forEach(key => {
        let inp: Array<string> = [],
            typeName = object[key],
            parameter: string = key;

        // Check if the object[key] is a Input instance
        if (object[key] instanceof InputClass) {
            const InputInstance = object[key] as InputClass;

            // Loop through the Input instance
            Object.keys(InputInstance.Inputs).forEach(key => {
                inp.push(`${key}: ${InputInstance.Inputs[key]}`);
            });

            // set the parameter
            parameter += `(${inp.join(', ')})`;

            // set the typeName to the type
            typeName = InputInstance.Type;
        }

        // push the key and the typeName
        gql.push(`${parameter}: ${typeName}`);
    });

    // Return the output
    return `${precurser} ${name} {${gql.join(', ')}}`;
}