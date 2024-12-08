import { Scanner } from '../scanners/scanner';
import { GitHubScanner } from '../scanners/gitHubScanner';

export class ScannerFactory {
    /**
     * Create a scanner based on the type.
     * @param {string} scannerType - The type of scanner (e.g., 'github')
     * @returns {Scanner} - The appropriate scanner instance
     */
    static createScanner(scannerType: string, token: string): Scanner {
        switch (scannerType.toLowerCase()) {
            case 'github':
                return new GitHubScanner(token);
            default:
                throw new Error(`Scanner type '${scannerType}' is not recognized.`);
        }
    }
}

