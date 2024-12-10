import { graphql } from '@octokit/graphql';
import { Octokit } from "@octokit/rest";
import { ErrorUtils } from "../utils/errorUtils.js";
import { FILE_CONTENT_QUERY, LIST_REPOSITORIES_QUERY, REPOSITORY_METADATA_QUERY, REPOSITORY_TREE_QUERY} from  "../queries/gitHubQueries.js";
import { Webhook, RepositoryInfo, ListRepositoriesResponse, RepositoryObject, RepositoryTreeResult, RepositoryDetails } from '../utils/types.js';
import { CONFIG, ERROR_CODES, ERROR_MESSAGES } from '../configs/scannerConfig.js';
import { ApiUtils } from '../utils/apiUtils.js';

/**
 * Service class for handling repository operations.
 */
export class GitHubService{
    private readonly client: Octokit;
    private readonly token;
    private static readonly BLOB = 'blob';
    private static readonly TREE = 'tree';
    private static readonly YAML_EXTENSIONS = ['.yml', '.yaml'];

    constructor(token: string) { 
        this.token = token;
        this.client = new Octokit({ auth: token });
    }
  
    /**
     * Fetch list of repositories with pagination.
     */
    async fetchRepositories(): Promise<RepositoryInfo[]> {
        const token = ApiUtils.getAuthHeader(this.token);
        const paginationSize = CONFIG.PAGE_SIZE;
        let after: string | null = null;
        let results: RepositoryInfo[] = [];

        try {
            while (true) {
                const response: ListRepositoriesResponse = await graphql(
                    LIST_REPOSITORIES_QUERY,
                    {
                        first: paginationSize,
                        after,
                        headers: { authorization: token },
                    }
                );
    
                const { nodes, pageInfo } = response.viewer.repositories;
                const extractedData = nodes.map(this.extractBaseDetails);
                results.push(...extractedData);
    
                if (!pageInfo.hasNextPage) {
                    break;
                }
    
                after = pageInfo.endCursor;
            }
            return results;
        } catch (error) {
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.FETCHING_REPOSITORIES_FAILED_MSG, ERROR_CODES.FETCH_REPOSITORIES_FAILED, 500, error);
        }
    }

     /**
     * Fetch details of a specific repository.
     */
     async fetchRepositoryDetails(repoName: string, branchName: string = CONFIG.DEFAULT_BRANCH): Promise<RepositoryDetails> {
        const branchPrefix = `${branchName}:`;
        const repoTreeResult: RepositoryTreeResult = { fileCount: 0, ymlContent: null };
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


    private async processRepositoryTree(repoName: string, branchPrefix: string, repoTreeResult: RepositoryTreeResult):
        Promise<RepositoryTreeResult> {
        const branchWithPath = `${branchPrefix}`;
        
        const repositoryObject = await this.fetchRepositoryTree(repoName, branchWithPath);
        if (!repositoryObject || !repositoryObject.entries) {
            return { fileCount: 0, ymlContent: null };
        }
    
        const subdirectoryPromises: Promise<RepositoryTreeResult>[] = [];
    
        for (const entry of repositoryObject.entries) {
            if (entry.type === GitHubService.BLOB) {
                repoTreeResult.fileCount++;
                if (!repoTreeResult.ymlContent && GitHubService.YAML_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
                    repoTreeResult.ymlContent = await this.getFileContent(repoName, branchWithPath, entry.name);
                }
            } else if (entry.type === GitHubService.TREE) {
                subdirectoryPromises.push(
                    this.processRepositoryTree(repoName, `${branchWithPath}${entry.name}/`, repoTreeResult)
                );
            }
        }
        // Recursively process subdirectories concurrently
        const subdirectoryResults = await Promise.all(subdirectoryPromises);
    
        return {
            fileCount: repoTreeResult.fileCount + subdirectoryResults.reduce((sum, result) => sum + result.fileCount, 0),
            ymlContent: repoTreeResult.ymlContent || subdirectoryResults.find(r => r.ymlContent)?.ymlContent || null
        };
    }


    private async fetchMetadata(repoName: string): Promise<RepositoryInfo & { isPrivate: boolean }> {       
        const token = ApiUtils.getAuthHeader(this.token);
    
        try {
            const response = await graphql<{
                viewer: {
                    repository: RepositoryInfo & { isPrivate: boolean };
                };
            }>(REPOSITORY_METADATA_QUERY, {
                repoName,
                headers: { authorization: token },
            });
    
            const repository = response.viewer.repository;
            const baseDetails = this.extractBaseDetails(repository);
            return {
                ...baseDetails,
                isPrivate: repository.isPrivate,
            };
        } catch (error) {
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.FETCH_METADATA_FAILED_MSG, ERROR_CODES.FETCH_METADATA_FAILED, 500, error);
        }
    }


    private async fetchRepositoryTree(repoName: string, branchWithPath: string): Promise<RepositoryObject | null> {
        try {            
            const response = await graphql<{ viewer: { repository: { object: RepositoryObject | null } } }>(
                REPOSITORY_TREE_QUERY,
                {
                    repoName,
                    branchName: branchWithPath,
                    headers: { authorization: ApiUtils.getAuthHeader(this.token) },
                }
            );
            return response.viewer.repository?.object || null;
        } catch (error) {
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.FETCH_REPO_ENTRIES_FAILED_MSG, ERROR_CODES.FETCH_ENTRIES_FAILED, 500, error);
        }
    }


    private async getWebhooks(owner: string, repo: string): Promise<Webhook[]> {
        try {            
            const response = await this.client.repos.listWebhooks({
                owner,
                repo,
            });
    
            if (!response.data || response.data.length === 0) {
                return [];
            }
            return response.data as Webhook[];
        } catch (error) {
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.FETCH_WEBHOOKS_FAILED_MSG, ERROR_CODES.FETCH_WEBHOOKS_FAILED, 500, error);
        }
    }

      
    private async getFileContent(repoName: string, branchWithPath: string, fileName: string): Promise<string> {
        const token = ApiUtils.getAuthHeader(this.token);
        const fileExpression = `${branchWithPath}${fileName}`;
    
        try {
            const response = await graphql<{ viewer: { repository: { object: { text: string } | null } } }>(
                FILE_CONTENT_QUERY,
                {
                    repoName,
                    fileExpression,
                    headers: { authorization: token },
                }
            );
    
            return response.viewer.repository?.object?.text || '';
        } catch (error) {
            throw ErrorUtils.createGraphQLError(
                ERROR_MESSAGES.FETCH_FILE_FAILED_MSG.replace('{expression}',
                fileExpression),
                ERROR_CODES.FETCH_FILE_FAILED,
                500,
                error
            );
        }
    }
    

    private extractBaseDetails(repo: any): RepositoryInfo  {
        return {
            name: repo.name,
            size: repo.diskUsage,
            owner: repo.owner.login,
        };
    }
};
