import _ from 'lodash';

export interface ProjectionInterface {
    [key: string]: any
}

export interface ArgumentsInterface {
    [key: string]: any
}

export default (context:any): {
    projection: ProjectionInterface,
    arguments: ArgumentsInterface
} => {
    let projection: ProjectionInterface = {};
    let args: ArgumentsInterface = {};

    const recurse = (selection:any, parentName:string[] = []): void => {
        
        for(const newSelection in Object.keys(selection)) {
            // Current selection
            const current: any = selection[newSelection];

            // If the current selection is a field
            if(current?.kind === 'Field') {
                // If the current selection name is not null
                if(current.name === null) continue;

                // If the parent name is not undefined
                if(parentName[0] !== undefined) {
                    // turn tje parentName array into an object
                    // eg [ 'hello', 'other' ], name => { hello: other: { name: 1 } }

                    _.merge(projection, [...parentName, null].reduceRight((obj: {}, next : string | null):  { [x: string]: {}}  => {
                        if(next === null) return ({[current.name.value]: 1});

                        return ({[next]: obj});
                    }, {})); 
                }
                    
                // If the parent name is null,
                // then merge the projection with the current selection
                else {
                    _.merge(projection, {[current.name.value]: 1});

                    // if(current?.arguments) { 
                    //     _.merge(args, {[current.name.value]: 1});
                    // }
                }

                _.merge(args, [...parentName, null].reduceRight((obj: {}, next : string | null):  { [x: string]: {}}  => {
                    if(next === null) {
                        let returnable: {[x: string]: any} = {};

                        // For each argument in the current selection
                        // Add the argument to the returnable object
                        for(const argument of current.arguments) {
                            // If the argument contains more than one value
                            if(argument.value?.fields) for (const field of argument.value.fields) {
                                returnable[field.name.value] = field.value.value;
                            }

                            // If the argument contains only one value
                            else returnable[argument.name.value] = argument.value.value;
                        }

                        // Check if the current selection has arguments
                        if(Object.keys(returnable).length > 0) {
                            return { [current.name.value]: returnable };
                        }

                        // If the current selection has no arguments,
                        // Return an empty object
                        else return {};
                    }

                    return ({[next]: obj});
                }, {}));
            }

            // If the current selection is an array, we need to recurse
            if(current?.selectionSet?.selections)
                recurse(current.selectionSet.selections, [...parentName, current.name.value]);
        }
    }

    // Start the recursive function
    recurse(context.operation.selectionSet.selections);

    // Finally return the projection
    return {
        projection,
        arguments: args
    };
}