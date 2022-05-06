# mongo-graphql-layer

Automagicaly converts your MongoDB to a GraphQL endpoint!

The aim of this project is to recreate the functionality of [Contentful](https://www.contentful.com/developers/docs/references/content-delivery-api/), In their API, Contentful is able to deliver content to your application in a simple and efficient way, by defining a schema for the content, and then constructing a graphql schema from that.

Note, There is a plan to offer both a GraphQL and a REST API, but for now, only the GraphQL API is available.
thers also a plan to offer different flavours of databases, but for now, only MongoDB is supported.

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

#### Notes

- We need a way to prevent some basic attacks, like supplying a huge Regex to a search.
  A way to limit the ammount of times a recursive function can recurse, so it doesn't go into an infinite loop.

#### Optimization

I've got a few ideas for optimization.

- When a user makes a request, hooks need to be gatherd, grouped and executed.
  This is a lot of work, I was thinking of grouping hooks when the server is starting up, and then only executing them when the user makes a request.

  This will be implemented when I rewrite the schema parser.