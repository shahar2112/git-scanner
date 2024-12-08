import { ScannerFactory } from '../services/scannerFactory';
const repoResolvers = {
    Query: {
        listRepositories: async (_, __, { scannerType, token }) => {
            try {
                const scanner = ScannerFactory.createScanner(scannerType, token);
                return await scanner.fetchData();
            }
            catch (error) {
                throw new Error(`Error fetching repositories: ${error}`);
            }
        },
        getRepositoryDetails: async (_, { repoNames }, { scannerType, token }) => {
            try {
                const scanner = ScannerFactory.createScanner(scannerType, token);
                return await scanner.fetchDetails(repoNames);
            }
            catch (error) {
                throw new Error(`Error fetching repository details: ${error}`);
            }
        },
    },
};
export default repoResolvers;
