import { RepositoryDetails, RepositoryInfo } from "../utils/types.js";

/**
 * 
 * This interface defines the structure that must be implemented by any scanner class
 * responsible for interacting with repositories (e.g., fetching repository data,
 * repository details).
 * 
 */
export interface RepositoryScanner {
	fetchRepositoryData(): Promise<RepositoryInfo[]>;
	fetchRepositoryDetails(repoName: string | string[]): Promise<RepositoryDetails>;
}