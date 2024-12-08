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
        type: 'blob' | 'tree';
    }];
}