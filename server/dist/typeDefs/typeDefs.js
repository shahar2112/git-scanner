import { gql } from 'graphql-tag';
export const typeDefs = gql `
    type WebhookConfig {
        url: String
        content_type: String
        secret: String
    }

    type Webhook {
        id: Int!
        name: String!
        config: WebhookConfig
        events: [String!]!
        active: Boolean!
    }

    type Repository {
        name: String!
        size: Int!
        owner: String!
    }

    type RepositoryDetails {
        name: String!
        size: Int!
        owner: String!
        isPrivate: Boolean
        numberOfFiles: Int
        ymlContent: String
        webhooks: [Webhook]
    }

    type Query {
        listRepositories: [Repository!]!
        getRepositoryDetails(repoName: String!, branchName:String): RepositoryDetails
    }
`;
