import { Scanner } from './scanner';
import {GitHubService} from '../services/gitHubService';
import pLimit from 'p-limit';
import { CONFIG } from '../configs/scannerConfig';
import { ErrorUtils } from '../utils/errorUtils';

export class GitHubScanner implements Scanner {
    private gitHubService: GitHubService;

    constructor(token: string) {
        this.gitHubService = new GitHubService(token);
    }

    /**
     * Fetch basic repository data.
     * @returns {Promise<any[]>} - List of repository base details.
    */
    async fetchData(): Promise<any[]> {
        try {
            const repos = await this.gitHubService.fetchRepositories();
            return repos;
        } catch (error) {
            console.error('Error fetching repository data:', error);
            return ErrorUtils.retryRequest(error, 0, () => this.fetchData());
        }
    }
    
   /**
   * Fetch repository details.
   * @param {String} repoNames - Names of the repositories.
   * @returns {Promise<any>} - Repository details.
   */
    async fetchDetails(repoNames: string[]): Promise<any> {
        const limit = pLimit(CONFIG.LIMIT_SIZE);
        try {
            const repoDetailsPromises = repoNames.map(repoName =>
                limit(() => this.gitHubService.fetchRepositoryDetails(repoName))
            );
            const repoDetails = await Promise.all(repoDetailsPromises);
            console.debug('repoDetails---------', repoDetails);
            return repoDetails;
        } catch (error) {
            return ErrorUtils.retryRequest(error, 0, () => this.fetchDetails(repoNames));
        }
    }
}