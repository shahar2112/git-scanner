* update default branch as main/master or other in config file, or you can specify different branches when fetching if you add it as a parameter
*the mapping of the query results can be done also in ui side, since its a backend position and the ui part is a bonus i did the mapping in the be side
*token permissions repository
*In the Fetch we can use a single, comprehensive query (e.g., REPOSITORY_DETAILS_QUERY) for the matadata and traversal and keep the code more DRY but well fetch details like name, owner, and diskUsage repeatedly. since I need to traverse deeply nested directories but only care about specific fields during traversal, I splitted the queries and created a lighter querie for tree traversal.
(Using a lighter query during recursion avoids bloating each API response with unnecessary data.)
export const REPOSITORY_DETAILS_QUERY = `
    query($repoName: String!, $branchName: String!) {
        viewer {
            repository(name: $repoName) {
                name
                diskUsage
                owner {
                    login
                }
                isPrivate
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

* Since GitHub's API reset every hour i added rateLimits of 60 minutes, for network issues 1 sec, this is configurable
*I used promise all for simplicity but we can use promise all settled and wait for all promises to finish and retry the rejected ones