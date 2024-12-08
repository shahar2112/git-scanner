import { CONFIG } from "../configs/scannerConfig";
export class ErrorUtils {
    static MAX_RETRIES = 3;
    static RETRY_DELAY_MS = 1000;
    static RATE_LIMIT_MESSAGE = 'Rate limit exceeded';
    static handleError(error, contextMessage) {
        console.error(`[Error]: ${contextMessage}`);
        if (error instanceof Error) {
            console.error(`[Message]: ${error.message}`);
            console.error(`[Stack]: ${error.stack}`);
        }
        throw error;
    }
    /**
     * Handle error with retry mechanism.
     * @param attempt - Current attempt number.
     * @param callback - The callback function to execute.
     */
    static async retryRequest(error, attempt, callback) {
        if (attempt < this.MAX_RETRIES && error instanceof Error) {
            let interval;
            if (this.isRateLimitError(error)) {
                interval = CONFIG.RATE_LIMIT_INTERVAL;
                console.log(`Rate limit exceeded, waiting for ${interval} ms before retrying.`);
            }
            else if (this.isNetworkError(error)) {
                interval = CONFIG.NETWORK_ERROR_INTERVAL;
                console.log(`Network error, waiting for ${interval} ms before retrying.`);
            }
            else {
                throw error;
            }
            try {
                await new Promise(res => setTimeout(res, interval));
                return await callback();
            }
            catch (error) {
                console.log(`Retry attempt ${attempt + 1}`);
                return this.retryRequest(error, attempt + 1, callback);
            }
        }
        return;
    }
    static isRateLimitError(error) {
        return error.message.includes(this.RATE_LIMIT_MESSAGE) ||
            error.response?.status === 403;
    }
    static isNetworkError(error) {
        return error.message.includes('ECONNRESET') || error.message.includes('ECONNABORTED');
    }
}
;
