import schemaValue from '../../../lexer/types/value';

import { types } from '../../../types';
import { ObjectId } from 'mongodb';
import { ArgumentsInterface, projectionInterface } from './database/parseQuery';
import { groupHooks } from '../../../accessControl/groupHooks';

export namespace Resolver { 

    export type QueryFilterOutput = { 
        [key: string]: string | number | boolean | ObjectId | Array<string | number | boolean | ObjectId> | {} | QueryFilterOutput;
    }
    
    export type FilterObject = QueryFilterObject;

    export type TFilter = 'function' | 'query';

    export type QueryFilterObject = {
        func: (input: any, data: any, database?: types.database) => QueryFilterOutput, 
        input: schemaValue.GqlType, 
        actualKey?: string,
        schemaKey?: string,
    }

    export type IRequest = {
        collectionName: string;
        individualName: string;

        projection: projectionInterface;
        arguments: ArgumentsInterface

        filter: { [x: string]: FilterObject };
        hookBank: groupHooks;
    }
}