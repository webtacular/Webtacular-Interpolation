import { ObjectId } from 'mongodb';
import { types } from '../../../types';
import schemaValue from '../../../parser/types/value';

export type FilterType = 'function' | 'query';

export interface QueryFilterObject {
    func: (input: any, data: any, database?: types.database) => QueryFilterOutput, 
    input: schemaValue.GqlType, 
    actualKey?: string,
    schemaKey?: string,
}

export interface QueryFilterOutput {
    [key: string]: string | number | boolean | ObjectId | Array<string | number | boolean | ObjectId> | {} | QueryFilterOutput;
}

export type FilterObject = QueryFilterObject;

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

            Is: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: input
                        }
                    }
                },
                input: '[String]',
            },

            IsNot: {
                func: (input: any, self: QueryFilterObject): QueryFilterOutput => {
                    return {
                        $match: {
                            [self.actualKey]: { $ne: input }
                        }
                    }
                },
                input: 'String',
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
            },

        },
    },

    'float': { 
        gql: 'Float' ,
        filter: {},
    },
};
