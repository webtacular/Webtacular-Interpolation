The goal of this section is to generate a parser that can parse the schema into a tree of objects that can then be
processed by the Graphql and rest transpilers.

## Beautifly understandable boilerplate, straightforward and easy to use

**Still in progress**: This here demonstrates a schema that interfaces with a MongoDB database, Support for SQL and other databases is planned.

At its purest, all you need to do is to create a layout of your database, providing it just the name and the expected type of each value.

### Json database

This here is an example of the layout of the data base that we are trying to interface with.

As you can see, login history is a list of objects, each one containing the following fields:

- `login_date`: The date of the login
- `login_ip`: The IP address of the login


```json
[
    {
        "id": ObjectId("628d1c031d9bab60dee2b8ef"),
        "userName": "John Doe",
        "loginHistory": [
            {
                "login_date": "2018-01-01T00:00:00.000Z",
                "login_ip": "8.8.8.8",
            },
            {
                "login_date": "2018-01-01T00:00:00.000Z",
                "login_ip": "4.4.8.8",
            }
        ]
    }
]
```

Heres the Json database processed into a schema.

#### Root object

The initial **new schemaObject.init** function is called to create a root object,
which is the root of the tree, it contains information about the database and the collection it represents.

There can be muliple root objects, meaning that you can lace multiple databases/types of databases together.

#### Value object

We than create a **new schemaValue.init** function to create a value object, which is a leaf of the tree,
it contains information about the value and its type, if a value has *unappealing* name, eg, random underscores,
you can define a custom mask, which will be provided to the user, making it easier to read, eg *_id* => *id*, the original is still kept and used when fetching the value, meaning that nothing at the database level needs to be changed.

We can also identify a value as a list, meaning that it is a list of values, eg, a list of names, or a list of IP addresses, **Important note**: the list is not a list of objects, it is a list of values, so you need to create a new value object for each value in the list.

We can aslo define this value as being unique, allowing the root object to create a way to fetch a singluar value from the database, instead of a list of values.

#### Nested object

Now we want to get a list of objects (login history), so we create a **new schemaNested.init** function to create a nested object, when we call it, the parser assumes that the value is a direct child of the leafs parent, meaning that when nesting, youll need to make sure that the leafs parent name matches that of the database. (This project has already blow the scope out of the water, allowing the masking of nested objects is in consideration).

A nested object can be instantiated in two ways:

- **array**: The value is a list of objects, meaning that the value is a list of values, eg, a list of names, or a list of IP addresses, **Important note**: This is a list of objects, closely related to the root object in functionality, therefore the user can pass filters into this object etc.

- **none**: When *array* is not specified / or is set to false, this object will represent a single object, with leafs as its children.

### Schema

```typescript
parse(new schemaObject.init({
    collectionName: 'config',
    databaseName: 'test',
    name: 'config',
    collectionize: true,
}, {
    id: new schemaValue.init({
        type: 'id',
        unique: true,

        mask: [ '_id' ]
    }),

    userName: new schemaValue.init({
        type: 'string',
        unique: true,
    }),

    loginHistory: new schemaNested.init({
        array: true,
    }, {
        ip: new schemaValue.init({
            type: 'string',
            description: 'The ip address of the user',
            mask: [ 'login_ip' ]
        }),

        loginDate: new schemaValue.init({
            type: 'string',
            description: 'The date of the login',
            mask: [ 'login_date' ]
        }),
    }),
}));
```

### Output of the parser

I created the parser to be as strong as possible, it extracts as much data as possible from the schema, it does alot of work in the back, but than allows the resolvers to work stres free.

**Note**: Objects present in this json that have just one value present *identifier* are missing a second value, which is a getter function for the object its referring to, but parsing the schema to json gets rid of this.

``` JSON
{
  "processed": {
    "nested": {
      "628d227d2dd6e0a65c2b960b": {
        "collectionize": false,
        "identifier": "628d227d2dd6e0a65c2b960b",
        "uniqueValues": [],
        "maskArray": [],
        "mask": [
          "loginHistory"
        ],
        "parents": [
          {
            "identifier": "628d227d2dd6e0a65c2b960c"
          }
        ],
        "options": {
          "array": true
        },
        "obj": {},
        "key": "loginHistory",
        "parent": {
          "identifier": "628d227d2dd6e0a65c2b960c"
        }
      }
    },
    "values": {
      "628d227d2dd6e0a65c2b960e": {
        "parent": {
          "identifier": "628d227d2dd6e0a65c2b960b"
        },
        "identifier": "628d227d2dd6e0a65c2b960e",
        "values": {
          "ip": {
            "additionalValues": [
              {
                "key": "isIpUnique",
                "value": false
              },
              {
                "key": "ipDescription",
                "value": "The ip address of the user"
              }
            ],
            "identifier": "628d227d2dd6e0a65c2b9609",
            "hooks": [],
            "filters": {},
            "key": "ip",
            "options": {
              "unique": false,
              "description": "The ip address of the user",
              "array": false,
              "collectionName": "",
              "databaseName": "",
              "type": "string",
              "mask": [
                "ip_latest"
              ]
            },
            "mask": {
              "schema": {
                "mask": {
                  "loginHistory": {
                    "ip": 1
                  }
                },
                "maskArray": [
                  "loginHistory",
                  "ip"
                ],
                "key": "ip"
              },
              "database": {
                "mask": {
                  "loginHistory": {
                    "ip_latest": 1
                  }
                },
                "maskArray": [
                  "loginHistory",
                  "ip_latest"
                ],
                "key": "ip_latest"
              }
            },
            "parent": {
              "identifier": "628d227d2dd6e0a65c2b960b"
            }
          },
          "loginDate": {
            "additionalValues": [
              {
                "key": "isLogindateUnique",
                "value": false
              },
              {
                "key": "logindateDescription",
                "value": "The date of the login"
              }
            ],
            "identifier": "628d227d2dd6e0a65c2b960a",
            "hooks": [],
            "filters": {},
            "key": "loginDate",
            "options": {
              "unique": false,
              "description": "The date of the login",
              "array": false,
              "collectionName": "",
              "databaseName": "",
              "type": "string",
              "mask": [
                "login_date"
              ]
            },
            "mask": {
              "schema": {
                "mask": {
                  "loginHistory": {
                    "loginDate": 1
                  }
                },
                "maskArray": [
                  "loginHistory",
                  "loginDate"
                ],
                "key": "loginDate"
              },
              "database": {
                "mask": {
                  "loginHistory": {
                    "login_date": 1
                  }
                },
                "maskArray": [
                  "loginHistory",
                  "login_date"
                ],
                "key": "login_date"
              }
            },
            "parent": {
              "identifier": "628d227d2dd6e0a65c2b960b"
            }
          }
        },
        "nested": {}
      },
      "628d227d2dd6e0a65c2b960f": {
        "parent": {
          "identifier": "628d227d2dd6e0a65c2b960c"
        },
        "identifier": "628d227d2dd6e0a65c2b960f",
        "values": {
          "id": {
            "additionalValues": [
              {
                "key": "isIdUnique",
                "value": true
              },
              {
                "key": "idDescription",
                "value": ""
              }
            ],
            "identifier": "628d227d2dd6e0a65c2b9607",
            "hooks": [],
            "filters": {},
            "key": "id",
            "options": {
              "unique": true,
              "description": "",
              "array": false,
              "collectionName": "",
              "databaseName": "",
              "type": "id",
              "mask": [
                "_id"
              ]
            },
            "mask": {
              "schema": {
                "mask": {
                  "id": 1
                },
                "maskArray": [
                  "id"
                ],
                "key": "id"
              },
              "database": {
                "mask": {
                  "_id": 1
                },
                "maskArray": [
                  "_id"
                ],
                "key": "_id"
              }
            },
            "parent": {
              "identifier": "628d227d2dd6e0a65c2b960c"
            }
          },
          "userName": {
            "additionalValues": [
              {
                "key": "isUsernameUnique",
                "value": true
              },
              {
                "key": "usernameDescription",
                "value": ""
              }
            ],
            "identifier": "628d227d2dd6e0a65c2b9608",
            "hooks": [],
            "filters": {},
            "key": "userName",
            "options": {
              "unique": true,
              "description": "",
              "array": false,
              "collectionName": "",
              "databaseName": "",
              "type": "string"
            },
            "mask": {
              "schema": {
                "mask": {
                  "userName": 1
                },
                "maskArray": [
                  "userName"
                ],
                "key": "username"
              },
              "database": {
                "mask": {
                  "userName": 1
                },
                "maskArray": [
                  "userName"
                ],
                "key": "userName"
              }
            },
            "parent": {
              "identifier": "628d227d2dd6e0a65c2b960c"
            }
          }
        },
        "nested": {
          "loginHistory": {
            "identifier": "628d227d2dd6e0a65c2b960b"
          }
        }
      }
    },
    "object": {
      "628d227d2dd6e0a65c2b960c": {
        "collectionize": true,
        "identifier": "628d227d2dd6e0a65c2b960c",
        "uniqueValues": [
          {
            "identifier": "628d227d2dd6e0a65c2b9607"
          },
          {
            "identifier": "628d227d2dd6e0a65c2b9608"
          }
        ],
        "maskArray": [],
        "mask": [],
        "options": {
          "collectionName": "config",
          "databaseName": "test",
          "name": "config",
          "collectionize": true
        },
        "obj": {},
        "collectionizeFields": {
          "schema": {
            "collectionName": "collection",
            "individualName": "individual"
          },
          "types": {
            "collectionName": "undefinedCollection"
          }
        },
        "key": "config"
      }
    }
  },
  "hookBank": {}
}
```