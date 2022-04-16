declare type precurser = 'type' | 'interface' | 'input';
interface Inputs {
    [key: string]: string;
}
export declare class InputClass {
    Inputs: Inputs;
    Type: string;
    constructor(Input: Inputs, Type: string);
}
declare const _default: (object: {
    [key: string]: string | number | boolean | {} | InputClass;
}, name: string, precurser: precurser) => string;
export default _default;
