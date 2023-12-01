const express = require('express');
const path = require('path');
const db = require('./config/connection');

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3001;

const { typeDefs, resolvers } = require('./schema');
const { authenticate } = require('./auth');

const server = new ApolloServer({
  typeDefs,
  resolvers
});

async function startServer() {
  await server.start();

  // Open channel for JSON to be sent from client
  app.use(express.json());

  // Share dist folder files when in production only
  if (is_prod) {
      app.use(express.static(path.join(__dirname, '../client/dist')));
  }

  // Open cookie middleware channel so we can view cookies on the request object
  app.use(cookieParser());

  // Set up graphql routes to handle all of the api routes
  // Make sure the user's cookie is being sent through in every server request 
  app.use('/graphql', expressMiddleware(server, {
      context: authenticate
  }));

  // Trigger React router to handle all routing outside of our auth routes
  if (is_prod) {
      app.get('*', (req, res) => {
          res.sendFile(path.join(__dirname, '../client/dist/index.html'));
      });
  }

  // Validate that the mongoose connection is complete
  db.once('open', () => {
      console.log('DB connection established');

      app.listen(PORT, () => {
          console.log('Server listening on port', PORT);
          console.log('GraphQL ready at /graphql');
      });
  })
}

startServer();
