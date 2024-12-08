import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';
import { typeDefs } from './typeDefs/typeDefs';
import repoResolvers from './resolvers/repoResolver';
import { ErrorUtils } from './utils/errorUtils';
import { CONFIG } from './configs/scannerConfig';
import * as dotenv from 'dotenv';

dotenv.config();

const server = new ApolloServer({
  typeDefs,
  resolvers: repoResolvers,
});

async function startServer() {
  try {
    const scannerType = process.env.SCANNER_TYPE || CONFIG.DEFAULT_SCANNER; //TODO: MOVE TO UTILS METHOD

    try {
      const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },//TODO: GET PORT FROM UTILS??
        context: async () => {

          const token = process.env[`${scannerType.toUpperCase()}_TOKEN`];//TODO: MOVE TO UTILS METHOD
    
          if (!token) {
            throw new GraphQLError('No authentication token provided', {
              extensions: {
                code: 'UNAUTHENTICATED',
                http: { status: 401 }
              }
            });
          }
          return { scannerType, token }; 
        }
      });
  
      console.log(`🚀 Server ready at: ${url}`);
      } catch (error) {
        ErrorUtils.handleError(error, 'Failed to start the Apollo server');
        process.exit(1);
      }

  } catch (error) {
    ErrorUtils.handleError(error, 'Process failed');
    process.exit(1);
  }
}

// function extractTokenFromHeader(authorizationHeader: string | undefined): string {
//   if (!authorizationHeader) {
//     throw new Error('Authorization header is missing');
//   }
//   const token = authorizationHeader.replace('Bearer ', '');
//   if (!token) {
//       throw new Error('Token is missing in the authorization header');
//   }
//   return token;
// }

startServer();