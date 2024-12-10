import { ScannerFactory } from '../services/scannerFactory.js';
import { ErrorUtils } from '../utils/errorUtils.js';
const repoResolvers = {
    Query: {
        listRepositories: async (_, __, { scannerType, token }) => {
            const scanner = ScannerFactory.createScanner(scannerType, token);
            try {
                return await scanner.fetchRepositoryData();
            }
            catch (error) {
                const result = await ErrorUtils.retryRequest(error, 0, async () => await scanner.fetchRepositoryData());
                if (result !== undefined) {
                    return result;
                }
            }
        },
        getRepositoryDetails: async (_, { repoName }, { scannerType, token }) => {
            const scanner = ScannerFactory.createScanner(scannerType, token);
            try {
                return await scanner.fetchRepositoryDetails(repoName);
            }
            catch (error) {
                const result = await ErrorUtils.retryRequest(error, 0, async () => await scanner.fetchRepositoryDetails(repoName));
                if (result !== undefined) {
                    return result;
                }
            }
        },
    },
};
export default repoResolvers;
