import { Collection, MongoClient, MongoClientOptions } from 'mongodb';

export default class {
    #connectionString: string = '';
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
            const exp: RegExp = /^(mongodb:\/\/|mongodb\+srv:\/\/)/;

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