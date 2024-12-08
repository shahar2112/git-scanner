import { graphql } from '@octokit/graphql';
import { Octokit } from "@octokit/rest";
import { ErrorUtils } from "../utils/errorUtils";
import { FILE_CONTENT_QUERY, LIST_REPOSITORIES_QUERY, REPOSITORY_METADATA_QUERY, REPOSITORY_TREE_QUERY } from "../queries/gitHubQueries";
import { CONFIG } from '../configs/scannerConfig';
export class GitHubService {
    client;
    token;
    constructor(token) {
        this.token = token;
        this.client = new Octokit({ auth: token });
    }
    /**
     * Fetch list of repositories for authenticated user.
     */
    async fetchRepositories() {
        const token = `token ${this.token}`;
        const paginationSize = CONFIG.PAGE_SIZE;
        let after = null;
        let results = [];
        try {
            while (true) {
                const response = await graphql(LIST_REPOSITORIES_QUERY, {
                    first: paginationSize,
                    after,
                    headers: { authorization: token },
                });
                const { nodes, pageInfo } = response.viewer.repositories;
                const extractedData = nodes.map(this.extractBaseDetails);
                results.push(...extractedData);
                if (!pageInfo.hasNextPage) {
                    break;
                }
                after = pageInfo.endCursor;
            }
            return results;
        }
        catch (error) {
            ErrorUtils.handleError(error, "Error fetching repositories from GitHub.");
            return [];
        }
    }
    /**
     * Fetch details of a specific repository.
     */
    async fetchRepositoryDetails(repoName, branchName = CONFIG.DEFAULT_BRANCH) {
        const token = `token ${this.token}`;
        const branchPrefix = `${branchName}:`;
        const queue = ['.github/']; // Start with the root directory TODO:CHANGE THIS
        let fileCount = 0;
        let isYamlFound = false;
        let ymlContent = null;
        const metadata = await this.fetchMetadata(repoName);
        while (queue.length > 0) {
            const currentPath = queue.shift();
            const branchWithPath = `${branchPrefix}${currentPath}`;
            try {
                const response = await graphql(REPOSITORY_TREE_QUERY, {
                    repoName,
                    branchName: branchWithPath,
                    headers: { authorization: token },
                });
                const repositoryObject = response.viewer.repository?.object;
                if (!repositoryObject || !repositoryObject.entries)
                    continue;
                for (const entry of repositoryObject.entries) {
                    if (entry.type === 'blob') {
                        fileCount++;
                        if (!isYamlFound && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml'))) { //TODO: move to ,ethod
                            ymlContent = await this.getFileContent(repoName, branchWithPath, entry.name);
                            isYamlFound = true;
                        }
                    }
                    else if (entry.type === 'tree') {
                        queue.push(`${currentPath}${entry.name}/`);
                    }
                }
            }
            catch (error) {
                console.error(`Error fetching repository details for path: ${branchWithPath}`, error);
                throw new Error(`Failed to fetch repository details.` + error);
            }
        }
        const webhooks = await this.getWebhooks(metadata.owner, repoName);
        return {
            ...metadata,
            numberOfFiles: fileCount,
            ymlContent: ymlContent,
            webhooks: webhooks,
        };
    }
    async fetchMetadata(repoName) {
        try {
            const token = `token ${this.token}`;
            const response = await graphql(REPOSITORY_METADATA_QUERY, {
                repoName,
                headers: { authorization: token },
            });
            const repository = response.viewer.repository;
            const baseDetails = this.extractBaseDetails(repository);
            return {
                ...baseDetails,
                isPrivate: repository.isPrivate,
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch repository metadata.` + error);
        }
    }
    /**
     * Extract base details common to all repository responses.
     */
    extractBaseDetails(repo) {
        return {
            name: repo.name,
            size: repo.diskUsage,
            owner: repo.owner.login,
        };
    }
    async getWebhooks(owner, repo) {
        try {
            const response = await this.client.repos.listWebhooks({
                owner,
                repo,
            });
            if (!response.data || response.data.length === 0) {
                return [];
            }
            const webhooks = response.data;
            return webhooks;
        }
        catch (error) {
            console.error('Error fetching webhooks:', error);
            return [];
        }
    }
    /**
   * Get file content from a repository
   */
    async getFileContent(repoName, branchWithPath, fileName) {
        const token = `token ${this.token}`;
        const fileExpression = `${branchWithPath}${fileName}`;
        try {
            const response = await graphql(FILE_CONTENT_QUERY, {
                repoName,
                fileExpression,
                headers: { authorization: token },
            });
            console.log('response', response);
            return response.viewer.repository?.object?.text || '';
        }
        catch (error) {
            ErrorUtils.handleError(error, `Error fetching file content for ${fileExpression}`);
            return '';
        }
    }
}
;
