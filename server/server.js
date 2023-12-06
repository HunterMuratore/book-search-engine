const express = require('express');

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const cors = require('cors');

const path = require('path');
const db = require('./config/connection');

const { typeDefs, resolvers } = require('./schema');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  introspection: true,
  cors: true
});

async function startServer() {
  await server.start();
  
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Use expressMiddleware to manually handle the GraphQL endpoint
  app.use('/graphql', expressMiddleware(server));

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  db.once('open', () => {
    console.log('DB connection established');

    app.listen(PORT, () => {
      console.log('Server listening on port', PORT);
      console.log('GraphQL ready at /graphql');
    });
  });
}

startServer();