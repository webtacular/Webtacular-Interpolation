import { ObjectId } from "mongodb";
import { groupHooksInterface } from "../accessControl/groupHooks";

import schemaValue from "./types/value";
import schemaNested from "./types/objects/nested";
import schemaObject from "./types/objects/object";

export interface IReference {
    identifier: ObjectId;
    get: () => schemaNested.init | schemaObject.init;
}

export interface IValueReference {
    identifier: ObjectId;
    get: () => schemaValue.init;
}

export interface IHookReference {
    identifier: ObjectId;
    get: () => groupHooksInterface;
}

export interface INestedValues {
    [key: string]: IReference
}

export interface IProcessedValue {
    identifier: ObjectId;
    parent: IReference;
    nested: INestedValues;
    values: { [key: string]: schemaValue.init };
}

export interface IHookBank{
    [x: string]: groupHooksInterface;
}

export interface IProcessedObject {
    nested: { [x: string]: schemaNested.init };
    values: { [x: string]: IProcessedValue };
    object: { [x: string]: schemaObject.init };
}

export interface IOutput {
    processed: IProcessedObject;
    hookBank: IHookBank;
}