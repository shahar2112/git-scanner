import { ApolloClient, InMemoryCache } from '@apollo/client';
import { GRAPHQL_URI } from './configs/config';

const client = new ApolloClient({
  uri: GRAPHQL_URI,
  cache: new InMemoryCache(),
});

export default client;
