# Description

Showcases the possibility to implement lazy loading capabilities into GraphQL.

![animation](animation.gif)

## Background

Assume that your backend needs to perform multiple tasks such as retrieving data from DB to satisfy response. One could even think of more complex scenarios where multiple DB roundtrips and even different DBs, APIs and/or systems are involved.

The big benefit of GraphQL is that consumer's can specify the fields that they need exactly. Not only does this reduce the data payload and network load but also opens up optimization-opportunities for the provider.

Suppose, we have following data model.

```gql
type Vehicle {
    fin: Int
    texts: String
    codes: String
    pics: String
}
```

If ```texts```, ```codes```, ```pics``` were all retrieveable independently, following implementation could be used:

```js
class Vehicle {
    constructor(fin) {
        this.fin = fin;
        // do NOT retrieve pics, texts, codes during object-instanciation
    }

    async pics() {
        // retrieve from backend and return
    }

    async texts() {
        // retrieve from backend and return
    }

    async codes() {
        // retrieve from backend and return
    }
}
```

The way how this works is, that the properties are implemented as ```functions``` (they should be declared to be ```asynchronous``` to avoid blocking). Instead of creating a full-blown instance of our data object in the constructor, we outsource all the logic to retrieve and return the properties value into a separate function.

The beauty of this approach is that we don't have to create setters and getters for that. We use ```async pics()``` instead of the ```pics```-property.

Now, when consumers query our endpoint, the only reason for the pics()-function to execute and actually retrieve pictures if a consumer specificaly asks for that property.

If consumer does _not_ specify pics to be part of the response, it are not part of the result, the result may be much smaller and computed much faster. The provider benefits as well as he saves valueable compute-time which then might result in smaller infrastructure overall. It's a win-win for both sides.

## Caching

There may be use cases where the retrievals are very costly (time consuming, expensive, etc.). Under such circumstances and if you have slow moving/changing data, you might want to do the retrievals (we can refer to them as **data enrichments**) only once and then store them somewhere where you can access them quicker and at a much lower cost.

The implementation in ```server.js``` showcases how this can be done and combined with lazy loading from above.
