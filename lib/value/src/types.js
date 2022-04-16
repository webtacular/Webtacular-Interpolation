"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeMap = void 0;
// This is a function that validates that x, y are both valid numbers.
const isNumber = (x, y) => {
    // It could be a string, so we need to convert it to a number
    const xNum = Number(x), yNum = Number(y);
    // Check if both are numbers
    if (isNaN(xNum) || isNaN(yNum))
        return false;
    // Return the numbers
    return { x: xNum, y: yNum };
};
exports.TypeMap = {
    'string': {
        gql: 'String',
        filter: {
            // - Input: This parameter is input from the user, eg passing in a regex
            // - Data: This parameter is the data from the database, eg the value of a column
            //
            // @Return: boolean - true if the data should be included in the query
            //                  - false if the data should be excluded from the query
            MatchesRegex: {
                func: (input, data) => {
                    // We want to check if the data matches the regex (input, user provided)
                    // Instantiate a regex instance
                    const regex = new RegExp(input);
                    // Check the data against the regex
                    return regex.test(data);
                },
                input: 'string',
                data: 'string',
            },
            Is: {
                func: (input, data) => {
                    // We want to check if the data is equal to the input (input, user provided)
                    return data === input;
                },
                input: 'string',
                data: 'string',
            },
            IsNot: {
                func: (input, data) => {
                    // We want to check if the data is not equal to the input (input, user provided)
                    return data !== input;
                },
                input: 'string',
                data: 'string',
            },
            Exists: {
                func: (input, data) => {
                    // Check if the data exists
                    const exists = data !== undefined && data !== null;
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },
                input: 'boolean',
                data: 'boolean',
            }
        },
    },
    'number': {
        gql: 'Int',
        filter: {
            Is: {
                func: (input, data) => {
                    // We want to check if the data is equal to the input (input, user provided)
                    return data === input;
                },
                input: 'number',
                data: 'number',
            },
            IsNot: {
                func: (input, data) => {
                    // We want to check if the data is not equal to the input (input, user provided)
                    return data !== input;
                },
                input: 'number',
                data: 'number',
            },
            IsGreaterThan: {
                func: (input, data) => {
                    const nums = isNumber(input, data);
                    if (nums === false)
                        return false;
                    // Check if the data is greater than the input
                    return nums.x < nums.y;
                },
                input: 'number',
                data: 'number',
            },
            IsGreaterThanOrEqualTo: {
                func: (input, data) => {
                    const nums = isNumber(input, data);
                    if (nums === false)
                        return false;
                    // Check if the data is greater than or equal to the input
                    return nums.x <= nums.y;
                },
                input: 'number',
                data: 'number',
            },
            IsLessThan: {
                func: (input, data) => {
                    const nums = isNumber(input, data);
                    if (nums === false)
                        return false;
                    // Check if the data is less than the input
                    return nums.x > nums.y;
                },
                input: 'number',
                data: 'number',
            },
            IsLessThanOrEqualTo: {
                func: (input, data) => {
                    const nums = isNumber(input, data);
                    if (nums === false)
                        return false;
                    // Check if the data is less than or equal to the input
                    return nums.x >= nums.y;
                },
                input: 'number',
                data: 'number',
            },
            Exists: {
                func: (input, data) => {
                    // Check if the data exists
                    const exists = data !== undefined && data !== null;
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },
                input: 'boolean',
                data: 'boolean',
            }
        },
    },
    'boolean': {
        gql: 'Boolean',
        filter: {
            Is: {
                func: (input, data) => {
                    // Check if the data is equal to the input
                    return input == data;
                },
                input: 'boolean',
                data: 'boolean',
            },
            Exists: {
                func: (input, data) => {
                    // Check if the data exists
                    const exists = data !== undefined && data !== null;
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },
                input: 'boolean',
                data: 'boolean',
            }
        },
    },
    'id': {
        gql: 'ID',
        filter: {
            Is: {
                func: (input, data) => {
                    // Check if the data is equal to the input
                    return input == data;
                },
                input: 'string',
                data: 'string',
            },
            IsNot: {
                func: (input, data) => {
                    // Check if the data is not equal to the input
                    return input != data;
                },
                input: 'string',
                data: 'string',
            },
            Exists: {
                func: (input, data) => {
                    // Check if the data exists
                    const exists = data !== undefined && data !== null;
                    // If input is true, only return true if the data exists
                    // If input is false, only return true if the data does not exist
                    return input === true ? exists : !exists;
                },
                input: 'boolean',
                data: 'boolean',
            },
        },
    },
    'float': {
        gql: 'Float',
        filter: {},
    },
};
//# sourceMappingURL=types.js.map