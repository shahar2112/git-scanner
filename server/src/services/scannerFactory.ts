import { RepositoryScanner } from '../scanners/repositoryScanner.js';
import { GitHubScanner } from '../scanners/gitHubScanner.js';

export class ScannerFactory {
    /**
     * Create a scanner based on the type.
     * @param {string} scannerType - The type of scanner (e.g., 'github')
     * @returns {Scanner} - The appropriate scanner instance
     */
    static createScanner(scannerType: string, token: string): RepositoryScanner {
        switch (scannerType.toLowerCase()) {
            case 'github':
                return new GitHubScanner(token);
            default:
                throw new Error(`Scanner type '${scannerType}' is not recognized.`);
        }
    }
}

