import express from 'express';
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
async function startServer() {
    try {
        const app = express();
        const scannerType = CONFIG.DEFAULT_SCANNER;
        const server = new ApolloServer({
            typeDefs,
            resolvers: repoResolvers,
        });
        await server.start();
        app.use('/graphql', cors(), express.json(), expressMiddleware(server, {
            context: async () => {
                const token = process.env[`${scannerType.toUpperCase()}_TOKEN`];
                ApiUtils.validateToken(token);
                return { scannerType, token };
            }
        }));
        app.listen(CONFIG.PORT, () => {
            console.log(`🚀 Server ready at http://localhost:${CONFIG.PORT}/graphql`);
        });
    }
    catch (error) {
        ErrorUtils.logError(error, ERROR_MESSAGES.SERVER_START_FAIL);
        process.exit(1);
    }
}
startServer();
