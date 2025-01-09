import express, { Express } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import { CONFIG, ERROR_MESSAGES } from './configs/scannerConfig.js';
import { typeDefs } from './typeDefs/typeDefs.js';
import repoResolvers from './resolvers/repoResolver.js';
import { ApiUtils } from './utils/apiUtils.js';
import { ErrorUtils } from './utils/errorUtils.js';

dotenv.config();
interface MyContext {
  scannerType: string;
  token: string | undefined;
}

const createApolloServer = () => {
  return new ApolloServer<MyContext>({
    typeDefs,
    resolvers: repoResolvers,
  });
};

const configureAppMiddlewares = (app: Express, server: ApolloServer<MyContext>) => {
  app.use(cors());
  app.use(express.json());
  app.use(
    CONFIG.GRAPHQL_ENDPOINT,
    expressMiddleware(server, {
      context: async () => {
        const token = process.env[`${CONFIG.DEFAULT_SCANNER.toUpperCase()}_TOKEN`];
        ApiUtils.validateToken(token);
        return { scannerType: CONFIG.DEFAULT_SCANNER, token };
      }
    })
  );
};

const startExpressServer = (app: Express) => {
  app.listen(CONFIG.PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${CONFIG.PORT}/${CONFIG.GRAPHQL_ENDPOINT}`);
  });
};

async function startServer() {
  try {
    const app = express();
    const server = createApolloServer();
    await server.start();
    configureAppMiddlewares(app, server);
    startExpressServer(app);
  } catch (error) {
    ErrorUtils.logError(error, ERROR_MESSAGES.SERVER_START_FAIL);
  	process.exit(1);
  }
}

startServer();
