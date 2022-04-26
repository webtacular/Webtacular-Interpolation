import { ObjectId } from "mongodb";
import SchemaValue from "./value";

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
    func: (input: any, data: any) => QueryFilterOutput, 
    input: SchemaValue.GqlType, 
    type: 'query',
    actualKey?: string,
    schemaKey?: string
}

export interface QueryFilterOutput {
    [key: string]: string | number | boolean | ObjectId | Array<string | number | boolean | ObjectId> | {} | QueryFilterOutput;
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
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: input
                        }
                    }
                },

                input: '[String]',
                type: 'query'
            },

            IsNot: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $ne: input }
                        }
                    }
                },

                input: '[String]',
                type: 'query'
            },
            
            Exists: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $exists: input }
                        }
                    }
                },

                input: 'Boolean',
                type: 'query'
            }
        },
    },

    'number': { 
        gql: 'Int',
        filter: {
            Is: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: input
                        }
                    }
                },

                input: '[Int]',
                type: 'query'
            },

            IsNot: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $ne: input }
                        }
                    }
                },

                input: '[Int]',
                type: 'query'
            },

            IsGreaterThan: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $gt: input }
                        }
                    }
                },

                input: 'Int',
                type: 'query'
            },

            IsGreaterThanOrEqualTo: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $gte: input }
                        }
                    }
                },

                input: 'Int',
                type: 'query'
            },

            IsLessThan: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $lt: input }
                        }
                    }
                },

                input: 'Int',
                type: 'query'
            },

            IsLessThanOrEqualTo: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $lte: input }
                        }
                    }
                },

                input: 'Int',
                type: 'query'
            },

            Exists: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $exists: input }
                        }
                    }
                },

                input: 'Boolean',
                type: 'query'
            }
        },
    },

    'boolean': { 
        gql: 'Boolean',
        filter: {
            Is: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: input
                        }
                    }
                },
                
                input: '[Boolean]',
                type: 'query'
            },

            Exists: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $exists: input }
                        }
                    }
                },  

                input: 'Boolean',
                type: 'query'
            }
        },
    },

    'id': { 
        gql: 'ID',
        filter: {
            Is: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: input
                        }
                    }
                },  

                input: '[ID]',
                type: 'query'
            },

            IsNot: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $ne: input }
                        }
                    }
                },

                input: '[ID]',
                type: 'query'
            },

            Exists: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $exists: input }
                        }
                    }
                },

                input: 'Boolean',
                type: 'query'
            },

        },
    },

    'float': { 
        gql: 'Float' ,
        filter: {},
    },
};
