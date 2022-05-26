import { arrayToObject } from '../../../../general';
import { merge } from '../../../../merge';
import { mongoResponseObject } from './mongoDB';

export default function (contex:any): mongoResponseObject {
    let returnable: mongoResponseObject = {};

    // Walk the paramaters
    const walk = (data: any, parentName: string[] = []) => {
        for (let i = 0; i < data.length; i++) {
            const value = data[i];

            if(value.value.kind === 'ObjectValue')
                walk(value.value.fields, [...parentName, value.name.value]);
            
            else {
                let paramater = value?.value?.value;

                if(paramater === undefined && value?.value?.values) {
                    let paramArray: Array<any> = [];

                    for(let i = 0; i < value.value.values.length; i++) {
                        const val = value.value.values[i];

                        paramArray.push(convert(val.kind, val.value));
                    }

                    paramater = paramArray;

                } else paramater = convert(value.value.kind, value.value.value);

                returnable = merge(returnable, arrayToObject([...parentName, value.name.value], paramater));
            }
        }
    }

    walk(contex.arguments);

    return returnable;
}

//https://github.com/apollographql/apollo-server/blob/e468367d52e11f3127597e4fe920eb8294538289/packages/apollo-server-core/src/plugin/usageReporting/defaultUsageReportingSignature.ts
const convert = (type: string, value: any): number | Float64Array | string | Array<any> | {} => {
    switch (type) {
        case 'IntValue':
            return parseInt(value);

        case 'FloatValue':
            return parseFloat(value);

        case 'StringValue':
            return value;

        case 'ListValue':
            return value as Array<any>;
            
        case 'ObjectValue':
            return value as {};

        default:
            return value;
    }
}