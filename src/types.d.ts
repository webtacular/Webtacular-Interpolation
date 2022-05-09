export namespace types {
    export type basic = string | number | boolean;
    export type basicArray = string[] | number[] | boolean[];
    export type basicUnion = basic | basicArray;

    export type obj = { [x: string]: basicUnion | obj };
    export type anyType = basic | obj;
}