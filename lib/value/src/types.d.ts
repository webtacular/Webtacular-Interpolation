import SchemaValue from "..";
export declare const TypeMap: {
    string: {
        gql: string;
        filter: {
            [key: string]: {
                func: (input: any, data: any) => boolean;
                input: SchemaValue.type;
                data: SchemaValue.type;
            };
        };
    };
    number: {
        gql: string;
        filter: {
            [key: string]: {
                func: (input: any, data: any) => boolean;
                input: SchemaValue.type;
                data: SchemaValue.type;
            };
        };
    };
    boolean: {
        gql: string;
        filter: {
            [key: string]: {
                func: (input: any, data: any) => boolean;
                input: SchemaValue.type;
                data: SchemaValue.type;
            };
        };
    };
    id: {
        gql: string;
        filter: {
            [key: string]: {
                func: (input: any, data: any) => boolean;
                input: SchemaValue.type;
                data: SchemaValue.type;
            };
        };
    };
    float: {
        gql: string;
        filter: {
            [key: string]: {
                func: (input: any, data: any) => boolean;
                input: SchemaValue.type;
                data: SchemaValue.type;
            };
        };
    };
};
