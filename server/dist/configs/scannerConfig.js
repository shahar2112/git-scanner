export const CONFIG = {
    DEFAULT_SCANNER: 'github',
    PAGE_SIZE: 50,
    DEFAULT_BRANCH: 'master',
    LIMIT_SIZE: 2,
    PORT: Number(process.env.PORT) || 4000,
};
export const ERROR_CONFIG = {
    MAX_RETRIES: 3,
    NETWORK_ERROR_INTERVAL: Number(process.env.NETWORK_ERROR_INTERVAL) || 1000,
    RATE_LIMIT_INTERVAL: Number(process.env.RATE_LIMIT_INTERVAL) || 3600000,
};
export const ERROR_MESSAGES = {
    NO_AUTH_TOKEN: 'No authentication token provided',
    INVALID_AUTH_TOKEN: 'Invalid authentication token provided',
    SERVER_START_FAIL: 'Failed to start the Apollo server',
    PROCESS_FAIL: 'Process failed',
    RATE_LIMIT_EXCEEDED: 'rate limit exceeded',
    FETCHING_REPOSITORIES_FAILED_MSG: 'Error fetching repositories',
    FETCH_METADATA_FAILED_MSG: 'Failed to fetch repository metadata',
    FETCH_REPO_ENTRIES_FAILED_MSG: 'Failed to fetch repository entries',
    FETCH_WEBHOOKS_FAILED_MSG: 'Failed to fetch webhooks',
    FETCH_FILE_FAILED_MSG: 'Failed to fetch file content for {fileExpression}',
};
export const ERROR_CODES = {
    ECONNRESET: 'ECONNRESET',
    ECONNABORTED: 'ECONNABORTED',
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FETCH_REPOSITORIES_FAILED: 'FETCH_REPOSITORIES_FAILED',
    FETCH_METADATA_FAILED: 'FETCH_METADATA_FAILED',
    FETCH_ENTRIES_FAILED: 'FETCH_ENTRIES_FAILED',
    FETCH_WEBHOOKS_FAILED: 'FETCH_WEBHOOKS_FAILED',
    FETCH_FILE_FAILED: 'FETCH_FILE_FAILED',
};
