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

export type FilterType = 'function' | 'query';

export interface FuncFilterObject { 
    func: (input: any, data: any) => boolean, 
    input: SchemaValue.GqlType, 
    data: SchemaValue.type,
    type: 'function',
    actualKey?: string,
    schemaKey?: string
};

export interface QueryFilterObject {
    func: (input: any, data: any) => boolean, 
    input: SchemaValue.GqlType, 
    data: SchemaValue.type,
    type: 'query',
    actualKey?: string,
    schemaKey?: string
}

export type FilterObject = FuncFilterObject | QueryFilterObject;

export const TypeMap: {
    [x: string]: { 
        gql: string;
        filter: { 
            [key: string]: FilterObject
        }
    }
} = {
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

                input: 'String',
                data: 'string',
                type: 'function'
            },

            Is: {
                func: (input: any, data: any): boolean => {
                    // We want to check if the data is equal to the input (input, user provided)
                    return data === input;
                },

                input: '[String]',
                data: 'string',
                type: 'query'
            },

            IsNot: {
                func: (input: any, data: any): boolean => {
                    // We want to check if the data is not equal to the input (input, user provided)
                    return data !== input;
                },

                input: '[String]',
                data: 'string',
                type: 'query'
            },
            
            Exists: {
                func: (input: any, data: any): boolean => {
                    // Check if the data exists
                    const exists: boolean = data !== undefined && data !== null;
    
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },

                input: 'Boolean',
                data: 'boolean',
                type: 'query'
            }
        },
    },

    'number': { 
        gql: 'Int',
        filter: {
            Is: {
                func: (input: any, data: any): boolean => {
                    // We want to check if the data is equal to the input (input, user provided)
                    return data === input;
                },

                input: '[Int]',
                data: 'number',
                type: 'query'
            },

            IsNot: {
                func: (input: any, data: any): boolean => {
                    // We want to check if the data is not equal to the input (input, user provided)
                    return data !== input;
                },

                input: '[Int]',
                data: 'number',
                type: 'query'
            },

            IsGreaterThan: {
                func: (input: any, data: any): boolean => {
                    const nums: { x: number, y: number } | false = isNumber(input, data);
    
                    if (nums === false) return false;
    
                    // Check if the data is greater than the input
                    return nums.x < nums.y;
                },

                input: 'Int',
                data: 'number',
                type: 'query'
            },

            IsGreaterThanOrEqualTo: {
                func: (input: any, data: any): boolean => {
                    const nums: { x: number, y: number } | false = isNumber(input, data);
    
                    if (nums === false) return false;
    
                    // Check if the data is greater than or equal to the input
                    return nums.x <= nums.y;
                },

                input: 'Int',
                data: 'number',
                type: 'query'
            },

            IsLessThan: {
                func: (input: any, data: any): boolean => {
                    const nums: { x: number, y: number } | false = isNumber(input, data);
    
                    if (nums === false) return false;
    
                    // Check if the data is less than the input
                    return nums.x > nums.y;
                },

                input: 'Int',
                data: 'number',
                type: 'query'
            },

            IsLessThanOrEqualTo: {
                func: (input: any, data: any): boolean => {
                    const nums: { x: number, y: number } | false = isNumber(input, data);
    
                    if (nums === false) return false;
    
                    // Check if the data is less than or equal to the input
                    return nums.x >= nums.y;
                },

                input: 'Int',
                data: 'number',
                type: 'query'
            },

            Exists: {
                func: (input: any, data: any): boolean => {
                    // Check if the data exists
                    const exists: boolean = data !== undefined && data !== null;
    
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },

                input: 'Boolean',
                data: 'boolean',
                type: 'query'
            }
        },
    },

    'boolean': { 
        gql: 'Boolean',
        filter: {
            Is: {
                func: (input: any, data: any): boolean => {
                    // Check if the data is equal to the input
                    return input == data;
                },
                
                input: '[Boolean]',
                data: 'boolean',
                type: 'query'
            },

            Exists: {
                func: (input: any, data: any): boolean => {
                    // Check if the data exists
                    const exists: boolean = data !== undefined && data !== null;
    
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },

                input: 'Boolean',
                data: 'boolean',
                type: 'query'
            }
        },
    },

    'id': { 
        gql: 'ID',
        filter: {
            Is: {
                func: (input: any, data: any): boolean => {
                    // Check if the data is equal to the input
                    return input == data;
                },

                input: '[ID]',
                data: 'string',
                type: 'query'
            },

            IsNot: {
                func: (input: any, data: any): boolean => {
                    // Check if the data is not equal to the input
                    return input != data;
                },

                input: '[ID]',
                data: 'string',
                type: 'query'
            },

            Exists: {
                func: (input: any, data: any): boolean => {
                    // Check if the data exists
                    const exists: boolean = data !== undefined && data !== null;
    
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },

                input: 'Boolean',
                data: 'boolean',
                type: 'query'
            },

        },
    },

    'float': { 
        gql: 'Float' ,
        filter: {},
    },
};
