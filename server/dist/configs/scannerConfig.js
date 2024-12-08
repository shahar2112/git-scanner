export const CONFIG = {
    DEFAULT_SCANNER: "github",
    PAGE_SIZE: 50,
    DEFAULT_BRANCH: "master",
    LIMIT_SIZE: 2,
    NETWORK_ERROR_INTERVAL: Number(process.env.NETWORK_ERROR_INTERVAL) || 1000,
    RATE_LIMIT_INTERVAL: Number(process.env.RATE_LIMIT_INTERVAL) || 3600000,
};
