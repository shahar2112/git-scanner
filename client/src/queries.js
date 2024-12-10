import { gql } from '@apollo/client';


export const LIST_REPOSITORIES_QUERY = gql`
  query {
    listRepositories {
      name
      size
      owner
    }
  }
`;


export const GET_REPOSITORY_DETAILS_QUERY = gql`
  query($repoName: String!, $branchName: String) {
    getRepositoryDetails(repoName: $repoName, branchName: $branchName) {
      name
      size
      owner
      isPrivate
      numberOfFiles
      ymlContent
      webhooks {
        id
        name
        active
        config {
          url
          content_type
        }
      }
    }
  }
`;
