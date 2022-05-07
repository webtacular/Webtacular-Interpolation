import { Collection, MongoClient, ObjectId, MongoClientOptions } from 'mongodb';

// An type definition for an object that can contain all valid MongoDB types.
export interface mongoResponseObject {
    [key: string]: string | number | boolean | ObjectId | mongoResponseObject | Array<mongoResponseObject> | Record<string, unknown>;
}

export default class {
    #connectionString = '';
    #options: MongoClientOptions | undefined;
    #client: MongoClient | undefined;
    
    constructor(
        connectionString: string,
        options?: MongoClientOptions
    ) {
        this.#connectionString = connectionString;
        this.#options = options;
    }

    async init(): Promise<void > {
        return new Promise((resolve, reject) => {

            // Check if the connection string is valid ('mongodb://' or 'mongodb+srv://')
            const exp = /^(mongodb:\/\/|mongodb\+srv:\/\/)/;

            if(!exp.test(this.#connectionString))
                return reject(new Error(`Invalid connection string: ${this.#connectionString}`));

            const client: MongoClient = new MongoClient(this.#connectionString, this.#options);

            client.connect().then((): void => {
                this.#client = client;
                resolve(undefined);

            }).catch((): void => {
                return reject(new Error(`Failed to connect to the database.`));
            })
        });
        
    }

    getClient(): MongoClient {
        if(this.#client !== undefined) 
            return this.#client;

        else throw new Error(`The client is not initialized.`);
    }

    getCollection(database: string, collection: string): Collection<Document> {
        return this.getClient().db(database).collection(collection);
    }
}