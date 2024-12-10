import { RepositoryScanner } from './repositoryScanner.js';
import {GitHubService} from '../services/gitHubService.js';
import pLimit from 'p-limit';
import { CONFIG } from '../configs/scannerConfig.js';
import { RepositoryInfo, RepositoryDetails } from '../utils/types.js';

/**
 * Implements the Scanner interface to interact with GitHub API.
 * Manages rate-limited API requests using p-limit.
 */
export class GitHubScanner implements RepositoryScanner {
    private readonly limit = pLimit(CONFIG.LIMIT_SIZE);
    private gitHubService: GitHubService;

    constructor(token: string) {
        this.gitHubService = new GitHubService(token);
    }

    /**
     * Fetch basic repository data.
     * @returns {Promise<RepositoryInfo[]>} - List of repository base details.
    */
    async fetchRepositoryData(): Promise<RepositoryInfo[]> {
        const repos = await this.gitHubService.fetchRepositories();
        return repos;
    }
    
   /**
   * Fetch repository details.
   * @param {String} repoName - Name of the repository.
   * @returns {Promise<RepositoryDetails>} - Repository details.
   */
    async fetchRepositoryDetails(repoName: string): Promise<RepositoryDetails> {
        return this.limit(() => this.gitHubService.fetchRepositoryDetails(repoName));
    }
}