# Git Scanner Project

This project is a **Git Scanner** application that allows users to fetch repository data and view detailed information for each repository.

## Features
- Fetch a list of repositories.
- View repository details, including size, owner, and additional metadata.
- Built using Node.js for the backend and React for the frontend.

## Setup Instructions
### 1. Clone the Repository
```bash
git clone https://github.com/username/repository-name.git
cd repository-name

### 2. install dependencies
Backend:

cd server
npm install

Frontend:
cd ../client
npm install

## Configurations
Create a .env file in the server directory:
cd server
touch .env
add your token in .env with the name GITUB_TOKEN like this: GITHUB_TOKEN=__YourToken__


open both client and server in different windows
cd server
npm start

cd ../client
npm start

Configuration Options:
* Default Branch is master. You can specify the default branch (e.g., main, master) or use a different branch when fetching data by specifying it as a parameter in your query.

Additional Notes:
*the mapping of the query results can be done also in UI side, since its a backend position and the ui part is not mandatory, i did the mapping on the BE side.

*In the Fetch we can use a single, comprehensive query (e.g., REPOSITORY_DETAILS_QUERY) for the matadata and traversal and keep the code more DRY:
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
but in that case well fetch details like name, owner, and diskUsage repeatedly. since I need to traverse deeply nested directories but only care about specific fields during traversal, I splitted the queries and created a lighter querie for tree traversal.
(Using a lighter query during recursion avoids bloating each API response with unnecessary data.)

* Since GitHub's API reset every hour I added default rateLimits of 60 minutes, for network issues 1 sec, this is configurable in env variable.
