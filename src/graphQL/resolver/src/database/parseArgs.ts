/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Context } from 'apollo-server-core';
import { arrayToObject } from '../../../../general';
import { mongoResponseObject } from './mongoDB/mongo';
import _ from 'lodash';
import { types } from '../../../../types';

export default (contex: Context): types.obj => {
    const returnable: mongoResponseObject = {};

    // Walk the paramaters
    const walk = (data: types.obj, parentName: string[] = []) => {
        for (const key in data) {
            const value = data[key];
            // @ts-ignore
            if(value.value.kind === 'ObjectValue')
            // @ts-ignore
                walk(value.value.fields, [...parentName, value.name.value]);
            
            else {// @ts-ignore
                let paramater = value?.value?.value;
// @ts-ignore
                if(paramater === undefined && value?.value?.values) {
                    const paramArray: Array<types.basic> = [];
// @ts-ignore
                    value.value.values.forEach((value: { value: { value: types.basic}}) => {
                        paramArray.push(value.value.value);
                    });

                    paramater = paramArray;
                }

                // returnable[value.name.value] = paramater;
                // @ts-ignore
                _.merge(returnable, arrayToObject([...parentName, value.name.value], paramater));
            }
        }
    }
// @ts-ignore
    walk(contex.arguments);
// @ts-ignore
    return returnable;
}
