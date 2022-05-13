import { merge } from "lodash";
import { types } from "../../../types";
import schemaValue from "../../../parser/types/value";
import { ArgumentsInterface, projectionInterface } from "../database/parseQuery";

export default function filter(values: Array<schemaValue.init>, input: ArgumentsInterface, database: types.database): Array<projectionInterface> {
    if(!input?.filter) return [];
    
    let filteredValues: Array<projectionInterface> = [];

    for (let i = 0; i < values.length; i++) {
        const value = values[i],
            filters = value.filters,
            filterKeys = Object.keys(filters);

        // Loop through all the filters for this value
        for (let j = 0; j < filterKeys.length; j++) {

            // Get the filter's name
            const filterName = filterKeys[j], 
                // Get filter
                filter = filters[filterName];

            // If no filter was asked for, continue
            if(!input.filter[filterName])
                continue;

            // Process the filter
            const filterOutput = filter.func(
                input.filter[filterName],
                filter, 
                database
            );

            // Add the filter to the stack
            filteredValues.push(
                filterOutput
            );
        }
    }

    // Finally, return the filtered values
    return filteredValues;
}