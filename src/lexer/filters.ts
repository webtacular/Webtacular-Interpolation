import { formatValue } from "../general";
import schemaValue from "./types/value";

export type TExec = 'post' | 'pre';
export type TPreFunc = (mask: Array<string>) => any;
export type TPostFunc = (mask: Array<string>, value: schemaValue.type) => any;

export interface IValFilter {
    name: string;
    type: schemaValue.GqlType;
}

export interface IFilter {
    key: string;
    execution: TExec;
    filter: TPreFunc | TPostFunc;
    inputType: schemaValue.GqlType;
}

export interface IFilterBank extends Omit<IFilter, 'key'> {
    key: Array<string>;
}

const stringFilters: Array<IFilterBank> = [
    {
        key: [ 'contains' ],
        execution: 'pre',
        inputType: 'String',
        filter: (mask: Array<string>) => {}
    },
    {
        key: [ 'equals' ],
        execution: 'pre',
        inputType: 'String',
        filter: (mask: Array<string>) => {}
    },
    {
        key: [ 'notEquals' ],
        execution: 'pre',
        inputType: 'String',
        filter: (mask: Array<string>) => {}
    },
    {
        key: [ 'startsWith' ],
        execution: 'pre',
        inputType: 'String',
        filter: (mask: Array<string>) => {}
    }
]

function generateFilters(key: string, type: schemaValue.GqlType): Array<IValFilter> {
    const fill = (filter: Array<IFilterBank>): Array<IValFilter>  => {
        let filters: Array<IValFilter> = [];
        
        for(let i: number = 0; i < filter.length; i++) {
            // Format the name
            filters.push({
                name: formatValue([key, ...filter[i].key]),
                type: filter[i].inputType
            });
        }

        return filters;
    }

    switch(type) {
        case 'String':
            return fill(stringFilters);

        case 'Int':
            return fill([]);

        case 'Float':
            return fill([]);

        case 'ID':
            return fill([]);

        case 'Boolean':
            return fill([]);
    }
}

export default generateFilters;