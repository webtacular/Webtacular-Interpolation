# mongo-graphql-layer
Automagicaly converts your MongoDB to a GraphQL endpoint!

#### Example (Very very early version)

```js
const schema = new Construct.load({
    user: new Object.init({
        collection: 'users',
        searchable: true,
        key: 'user',
    }, {
        name: new Value.init({
            type: 'string',
            array: true,
            description: 'The name of the user',
        }),

        id: new Value.init({
            type: 'id',
            unique: true,
            mask: {
                '_id': 1,
            }
        }),

    })
}); 

console.log(schema.plainText());
```

Output

```graphql
type user {
    name: [String], 
    nameDescription: Boolean, 
    nameIsUnique: Boolean, 
    id: ID!, 
    idDescription: Boolean, 
    idIsUnique: Boolean
}

input userFilter {
    nameMatchesRegex: [String], 
    nameIs: [String], 
    nameIsNot: [String], 
    nameExists: [Boolean], 
    idIs: [ID], 
    idIsNot: [ID], 
    idExists: [Boolean]

}

type userCollection {
    total: Int, 
    max: Int, 
    items: [user]
}

type userQuery { 
    user(id: ID!): user, 
    userCollection(filter: userFilter): userCollection
}

type Query {
    userQuery: userQuery
}
```