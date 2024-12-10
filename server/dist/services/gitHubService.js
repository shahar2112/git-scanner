import { graphql } from '@octokit/graphql';
import { Octokit } from "@octokit/rest";
import { ErrorUtils } from "../utils/errorUtils.js";
import { FILE_CONTENT_QUERY, LIST_REPOSITORIES_QUERY, REPOSITORY_METADATA_QUERY, REPOSITORY_TREE_QUERY } from "../queries/gitHubQueries.js";
import { CONFIG, ERROR_CODES, ERROR_MESSAGES } from '../configs/scannerConfig.js';
import { ApiUtils } from '../utils/apiUtils.js';
/**
 * Service class for handling repository operations.
 */
export class GitHubService {
    client;
    token;
    static BLOB = 'blob';
    static TREE = 'tree';
    static YAML_EXTENSIONS = ['.yml', '.yaml'];
    constructor(token) {
        this.token = token;
        this.client = new Octokit({ auth: token });
    }
    /**
     * Fetch list of repositories with pagination.
     */
    async fetchRepositories() {
        const token = ApiUtils.getAuthHeader(this.token);
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
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.FETCHING_REPOSITORIES_FAILED_MSG, ERROR_CODES.FETCH_REPOSITORIES_FAILED, 500, error);
        }
    }
    /**
    * Fetch details of a specific repository.
    */
    async fetchRepositoryDetails(repoName, branchName = CONFIG.DEFAULT_BRANCH) {
        const branchPrefix = `${branchName}:`;
        const repoTreeResult = { fileCount: 0, ymlContent: null };
        const metadata = await this.fetchMetadata(repoName);
        const [webhooksResult, repositoryDetails] = await Promise.all([
            this.getWebhooks(metadata.owner, repoName),
            this.processRepositoryTree(repoName, branchPrefix, repoTreeResult)
        ]);
        return {
            ...metadata,
            numberOfFiles: repositoryDetails.fileCount,
            ymlContent: repositoryDetails.ymlContent !== null ? repositoryDetails.ymlContent : undefined,
            webhooks: webhooksResult,
        };
    }
    async processRepositoryTree(repoName, branchPrefix, repoTreeResult) {
        const branchWithPath = `${branchPrefix}`;
        const repositoryObject = await this.fetchRepositoryTree(repoName, branchWithPath);
        if (!repositoryObject || !repositoryObject.entries) {
            return { fileCount: 0, ymlContent: null };
        }
        const subdirectoryPromises = [];
        for (const entry of repositoryObject.entries) {
            if (entry.type === GitHubService.BLOB) {
                repoTreeResult.fileCount++;
                if (!repoTreeResult.ymlContent && GitHubService.YAML_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
                    repoTreeResult.ymlContent = await this.getFileContent(repoName, branchWithPath, entry.name);
                }
            }
            else if (entry.type === GitHubService.TREE) {
                subdirectoryPromises.push(this.processRepositoryTree(repoName, `${branchWithPath}${entry.name}/`, repoTreeResult));
            }
        }
        // Recursively process subdirectories concurrently
        const subdirectoryResults = await Promise.all(subdirectoryPromises);
        return {
            fileCount: repoTreeResult.fileCount + subdirectoryResults.reduce((sum, result) => sum + result.fileCount, 0),
            ymlContent: repoTreeResult.ymlContent || subdirectoryResults.find(r => r.ymlContent)?.ymlContent || null
        };
    }
    async fetchMetadata(repoName) {
        const token = ApiUtils.getAuthHeader(this.token);
        try {
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
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.FETCH_METADATA_FAILED_MSG, ERROR_CODES.FETCH_METADATA_FAILED, 500, error);
        }
    }
    async fetchRepositoryTree(repoName, branchWithPath) {
        try {
            const response = await graphql(REPOSITORY_TREE_QUERY, {
                repoName,
                branchName: branchWithPath,
                headers: { authorization: ApiUtils.getAuthHeader(this.token) },
            });
            return response.viewer.repository?.object || null;
        }
        catch (error) {
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.FETCH_REPO_ENTRIES_FAILED_MSG, ERROR_CODES.FETCH_ENTRIES_FAILED, 500, error);
        }
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
            return response.data;
        }
        catch (error) {
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.FETCH_WEBHOOKS_FAILED_MSG, ERROR_CODES.FETCH_WEBHOOKS_FAILED, 500, error);
        }
    }
    async getFileContent(repoName, branchWithPath, fileName) {
        const token = ApiUtils.getAuthHeader(this.token);
        const fileExpression = `${branchWithPath}${fileName}`;
        try {
            const response = await graphql(FILE_CONTENT_QUERY, {
                repoName,
                fileExpression,
                headers: { authorization: token },
            });
            return response.viewer.repository?.object?.text || '';
        }
        catch (error) {
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.FETCH_FILE_FAILED_MSG.replace('{expression}', fileExpression), ERROR_CODES.FETCH_FILE_FAILED, 500, error);
        }
    }
    extractBaseDetails(repo) {
        return {
            name: repo.name,
            size: repo.diskUsage,
            owner: repo.owner.login,
        };
    }
}
;
