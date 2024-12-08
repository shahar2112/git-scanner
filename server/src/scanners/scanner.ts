export interface Scanner {
  fetchData(): Promise<any[]>;
  fetchDetails(repoName: string[]): Promise<any>;
}