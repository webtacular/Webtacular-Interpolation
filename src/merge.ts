export function merge(target: any, source: any): any {  
    // The goal is to recreate _.merge
    // target is the object to be modified
    // source is the object to be merged
    // This is a recursive function, as the 
    // source and target object can be deeply nested
    // eg: source = { a: { b: { c: 1 } } }
    //     target = { a: { b: { d: 2 } } }
    //     result = { a: { b: { c: 1, d: 2 } } }

    const recurse = (r_target: any, r_source: any): any => {
        // Loop through the source object
        const r_sourceKeys = Object.keys(r_source ?? {});

        r_target = r_target ?? {};
        r_source = r_source ?? {};

        for (let i = 0; i < r_sourceKeys.length; i++) {
            const key = r_sourceKeys[i],
                value = r_source[key],
                r_value = r_target[key];

            if (typeof r_value !== 'object')
                // add the value to the target object
                r_target[key] = value;
            
            // Recurse if the key is an object
            if (typeof r_source[key] === 'object')
                recurse(r_target[key], r_source[key]);
        }

        return r_target;
    }

    return recurse(target, source);
}


// My custom merge function performs alllllllllot faster than lodash's
// https://www.measurethat.net/Benchmarks/Show/18683/0/merging-deeply-nested-objects
// On average, it's about 4x faster than lodash's