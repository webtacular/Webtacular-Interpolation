import { merge } from "lodash";
import { types } from "../../../types";
import schemaValue from "../../schema/value";
import { ArgumentsInterface, projectionInterface } from "../database/parseQuery";

export default function filter(values: Array<schemaValue.init>, input: ArgumentsInterface, database: types.database): Array<projectionInterface> {
    if(!input?.filter) return [];
    
    let filteredValues: Array<projectionInterface> = [];

    for (let i = 0; i < values.length; i++) {
        const value = values[i],
            filters = value.filters,
            filterKeys = Object.keys(filters);

        for (let j = 0; j < filterKeys.length; j++) {
            const filterName = filterKeys[j],
                filter = filters[filterName];

            if(!input.filter[filterName]) continue;

            filteredValues.push(filter.func(input[filterName], filter, database));
        }
    }

    return filteredValues;
}