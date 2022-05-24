import schemaValue from '../value';
import schemaNested from './nested';
import HookFunction from '../../../accessControl/hook';

import { ObjectId } from 'mongodb';
import { types } from '../../../types';
import { valueReference } from '../..';

namespace baseObject {
    export interface ValueInterface {
        [key: string]: schemaValue.init | schemaNested.init;
    }
    
    export interface Constructor {
        name?: string;

        array?: boolean;

        collectionize?: boolean;
        collectionizeFields?: {
            collectionName?: string;
            individualName?: string;
        }

        page?: {
            maxSize?: number;
            defaultSize?: number;
        }

        description?: string;
        searchable?: boolean;
        accessControl?: HookFunction.accessControlFunc;
    }

    export class init {
        options: Constructor;

        obj: ValueInterface

        collectionize: boolean = false;

        collectionizeFields: {
            schema: {
                collectionName: string;
                individualName: string;
            },
            types: {
                collectionName: string;
                individualName: string;
            },
        }

        key: string;

        identifier = new ObjectId();

        uniqueValues: Array<valueReference> = []; 

        maskArray: string[] = [];

        mask: { [key: string]: number | {} } = {};

        constructor(options: Constructor) {
            // [1] You can't have both an array and collectionize
            if(options.array === true && options.collectionize === true)
                throw new Error('You can\'t have both an array and collectionize');
        }
    }
}

export default baseObject;