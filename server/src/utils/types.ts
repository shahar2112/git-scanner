export type Webhook = {
    id: number;
    name: string;
    config: {
        url?: string;
        content_type?: string;
        secret?: string;
    };
    events: string[];
    active: boolean;
}

export type RepositoryInfo = {
    name: string;
    size: number;
    owner: string;
}

export type ListRepositoriesResponse = {
    viewer: {
        repositories: {
            nodes: RepositoryInfo[];
            pageInfo: {
                endCursor: string;
                hasNextPage: boolean;
            };
        };
    };
};

export type RepositoryObject = {
    entries: [{
        name: string;
        type: string;
    }];
}

export type RepositoryTreeResult = {
    fileCount: number;
    ymlContent: string | null;
}

export type RepositoryDetails = {
    name: String
    size: number
    owner: String
    isPrivate: Boolean
    numberOfFiles: number
    ymlContent?: String
    webhooks: Webhook[]
}