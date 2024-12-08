import { ScannerFactory } from '../services/scannerFactory';

const repoResolvers = {
  Query: {
    listRepositories: async (
      _: any,
      __: any,
      { scannerType, token }: { scannerType: string; token: string }
    ) => {
      try {
        const scanner = ScannerFactory.createScanner(scannerType, token);
        return await scanner.fetchData();
      } catch (error) {
        throw new Error(`Error fetching repositories: ${error}`);
      }
    },
    getRepositoryDetails: async (
      _: any,
      { repoNames }: { repoNames: string[] },
      { scannerType, token }: { scannerType: string; token: string }
    ) => {
      try {
        const scanner = ScannerFactory.createScanner(scannerType, token);
        return await scanner.fetchDetails(repoNames);
      } catch (error) {
        throw new Error(`Error fetching repository details: ${error}`);
      }
    },
  },
};

export default repoResolvers;
