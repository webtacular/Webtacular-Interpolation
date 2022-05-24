export namespace types {
    export type basic = string | number | boolean;
    export type basicArray = string[] | number[] | boolean[];
    export type basicUnion = basic | basicArray;

    export type obj = { [x: string]: basicUnion | obj };
    export type anyType = basic | obj;

    export type database = 'mongo' | 'sql';

    // export type mongoDBversion = 3.0 | 3.2 | 3.4 | 3.6 | 4.0 | 4.2 | 4.4 |

    export type casing = 'camel' | 'pascal' | 'snake' | 'kebab'

    export type mongoDBconnection = {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    }

    export type sqlDBconnection = {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    }

    export type databaseConnection = mongoDBconnection | sqlDBconnection;
}