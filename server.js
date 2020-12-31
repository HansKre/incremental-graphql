const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { v4 } = require('uuid');

const app = express();
const port = 5000;

const schema = buildSchema(`
  type Query {
    getVehicleByFin(fin: Int!): Vehicle
  },
  type Vehicle {
      fin: Int
      texts: String
      codes: String
      pics: String
  }
`);

class Vehicle {
    constructor(fin, enrichments) {
        this.fin = fin;
        if (enrichments) {
            Object.assign(this, enrichments);
        } else {
            vehicleCache.set(fin, []); // init cache
        }
    }

    resolve(property) {
        if (this.hasOwnProperty(property)) {
            return Promise.resolve(this[property]);
        } else {
            return new Promise(resolve => {
                setTimeout(() => {
                    const enrichment = v4();
                    const enrichments = vehicleCache.get(this.fin);
                    enrichments[property] = enrichment;
                    vehicleCache.set(this.fin, enrichments);
                    resolve(enrichment);
                }, 2000);
            });
        }
    }

    async pics() {
        const property = '_pics';
        return this.resolve(property);
    }

    async texts() {
        const property = '_texts';
        return this.resolve(property);
    }

    async codes() {
        const property = '_codes';
        return this.resolve(property);
    }
}

const vehicleCache = new Map();

const getVehicleByFin = ({ fin }) => {
    const enrichments = vehicleCache.get(fin);
    const enrichedVehicle = new Vehicle(fin, enrichments);
    return enrichedVehicle;
}

const resolver = {
    getVehicleByFin: getVehicleByFin,
};

app.use(
    '/graphql',
    graphqlHTTP({
        schema: schema,
        rootValue: resolver,
        graphiql: true,
    }),
);

app.listen(port, () => {
    console.log(`Graphiql available at http://localhost:${port}/graphql`)
})