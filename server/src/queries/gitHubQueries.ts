export const LIST_REPOSITORIES_QUERY = `
  query($first: Int, $after: String) {
          viewer {
              repositories(first: $first, after: $after) {
                  nodes {
                      name
                      diskUsage
                      owner {
                          login
                      }
                  }
                  pageInfo {
                      endCursor
                      hasNextPage
                  }
              }
          }
      }
  `;

export const REPOSITORY_METADATA_QUERY = `
  query ($repoName: String!) {
    viewer {
      repository(name: $repoName) {
        name
        diskUsage
        owner {
          login
        }
        isPrivate
      }
    }
  }
`;


export const REPOSITORY_TREE_QUERY = `
  query ($repoName: String!, $branchName: String!) {
    viewer {
      repository(name: $repoName) {
        object(expression: $branchName) {
          ... on Tree {
            entries {
              name
              type
            }
          }
        }
      }
    }
  }
`;


export const FILE_CONTENT_QUERY = `
  query($repoName: String!, $fileExpression: String!) {
    viewer {
      repository(name: $repoName) {
        object(expression: $fileExpression) {
          ... on Blob {
            text
          }
        }
      }
    }
  }
`;