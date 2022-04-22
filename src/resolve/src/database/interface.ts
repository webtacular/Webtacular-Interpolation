import { ObjectId } from "mongodb";

// An type definition for an object that can contain all valid MongoDB types.
export interface MongoResponseObject {
    [key: string]: string | number | boolean | ObjectId | MongoResponseObject | Array<MongoResponseObject> | {};
}