import SchemaValue from "..";

// This is a function that validates that x, y are both valid numbers.
const isNumber = (x: any, y: any): { x: number, y: number } | false => {
    // It could be a string, so we need to convert it to a number
    const xNum: number = Number(x),
        yNum: number = Number(y);

    // Check if both are numbers
    if (isNaN(xNum) || isNaN(yNum)) return false;
    
    // Return the numbers
    return { x: xNum, y: yNum };
}

export const TypeMap = {
    'string': { 
        gql: 'String',
        filter: {
            // - Input: This parameter is input from the user, eg passing in a regex
            // - Data: This parameter is the data from the database, eg the value of a column
            //
            // @Return: boolean - true if the data should be included in the query
            //                  - false if the data should be excluded from the query
            MatchesRegex: {
                func: (input: any, data: any): boolean => {
                    // We want to check if the data matches the regex (input, user provided)
                    
                    // Instantiate a regex instance
                    const regex: RegExp = new RegExp(input);
    
                    // Check the data against the regex
                    return regex.test(data);
                },

                input: 'string',
                data: 'string',
            },

            Is: {
                func: (input: any, data: any): boolean => {
                    // We want to check if the data is equal to the input (input, user provided)
                    return data === input;
                },

                input: 'string',
                data: 'string',
            },

            IsNot: {
                func: (input: any, data: any): boolean => {
                    // We want to check if the data is not equal to the input (input, user provided)
                    return data !== input;
                },

                input: 'string',
                data: 'string',
            },
            
            Exists: {
                func: (input: any, data: any): boolean => {
                    // Check if the data exists
                    const exists: boolean = data !== undefined && data !== null;
    
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },

                input: 'boolean',
                data: 'boolean',
            }
        } as { [key: string]: { func: (input: any, data: any) => boolean, input: SchemaValue.type, data: SchemaValue.type } },
    },

    'number': { 
        gql: 'Int',
        filter: {
            Is: {
                func: (input: any, data: any): boolean => {
                    // We want to check if the data is equal to the input (input, user provided)
                    return data === input;
                },

                input: 'number',
                data: 'number',
            },

            IsNot: {
                func: (input: any, data: any): boolean => {
                    // We want to check if the data is not equal to the input (input, user provided)
                    return data !== input;
                },

                input: 'number',
                data: 'number',
            },

            IsGreaterThan: {
                func: (input: any, data: any): boolean => {
                    const nums: { x: number, y: number } | false = isNumber(input, data);
    
                    if (nums === false) return false;
    
                    // Check if the data is greater than the input
                    return nums.x < nums.y;
                },

                input: 'number',
                data: 'number',
            },

            IsGreaterThanOrEqualTo: {
                func: (input: any, data: any): boolean => {
                    const nums: { x: number, y: number } | false = isNumber(input, data);
    
                    if (nums === false) return false;
    
                    // Check if the data is greater than or equal to the input
                    return nums.x <= nums.y;
                },

                input: 'number',
                data: 'number',
            },

            IsLessThan: {
                func: (input: any, data: any): boolean => {
                    const nums: { x: number, y: number } | false = isNumber(input, data);
    
                    if (nums === false) return false;
    
                    // Check if the data is less than the input
                    return nums.x > nums.y;
                },

                input: 'number',
                data: 'number',
            },

            IsLessThanOrEqualTo: {
                func: (input: any, data: any): boolean => {
                    const nums: { x: number, y: number } | false = isNumber(input, data);
    
                    if (nums === false) return false;
    
                    // Check if the data is less than or equal to the input
                    return nums.x >= nums.y;
                },

                input: 'number',
                data: 'number',
            },

            Exists: {
                func: (input: any, data: any): boolean => {
                    // Check if the data exists
                    const exists: boolean = data !== undefined && data !== null;
    
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },

                input: 'boolean',
                data: 'boolean',
            }
        } as { [key: string]: { func: (input: any, data: any) => boolean, input: SchemaValue.type, data: SchemaValue.type } },
    },

    'boolean': { 
        gql: 'Boolean',
        filter: {
            Is: {
                func: (input: any, data: any): boolean => {
                    // Check if the data is equal to the input
                    return input == data;
                },
                
                input: 'boolean',
                data: 'boolean',
            },

            Exists: {
                func: (input: any, data: any): boolean => {
                    // Check if the data exists
                    const exists: boolean = data !== undefined && data !== null;
    
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },

                input: 'boolean',
                data: 'boolean',
            }
        } as { [key: string]: { func: (input: any, data: any) => boolean, input: SchemaValue.type, data: SchemaValue.type } },
    },

    'id': { 
        gql: 'ID',
        filter: {
            Is: {
                func: (input: any, data: any): boolean => {
                    // Check if the data is equal to the input
                    return input == data;
                },

                input: 'id',
                data: 'string',
            },

            IsNot: {
                func: (input: any, data: any): boolean => {
                    // Check if the data is not equal to the input
                    return input != data;
                },

                input: 'id',
                data: 'string',
            },

            Exists: {
                func: (input: any, data: any): boolean => {
                    // Check if the data exists
                    const exists: boolean = data !== undefined && data !== null;
    
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },

                input: 'boolean',
                data: 'boolean',
            },

        } as { [key: string]: { func: (input: any, data: any) => boolean, input: SchemaValue.type, data: SchemaValue.type } },
    },

    'float': { 
        gql: 'Float' ,
        filter: {} as { [key: string]: { func: (input: any, data: any) => boolean, input: SchemaValue.type, data: SchemaValue.type } },
    },
};
