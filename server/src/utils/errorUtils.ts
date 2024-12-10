import { GraphQLError } from "graphql";
import { ERROR_CODES, ERROR_CONFIG, ERROR_MESSAGES } from "../configs/scannerConfig.js";

/**
 * Utility class for Error-related operations.
 */
export class ErrorUtils {

    static createGraphQLError(message: string, code: string, status: number, originalError?: unknown) {
        const originalMessage =
        originalError instanceof Error ? originalError.message : String(originalError);
        const combinedMessage = `${message}${originalMessage ? `: ${originalMessage}` : ''}`;
       
        const error = new GraphQLError(combinedMessage, {
            extensions: {
            code,
            http: { status }
            }
        });
        
        return error;
    }

    static logError(error: unknown, contextMessage?: string): void {
        console.error(`[Error]: ${contextMessage}`);
        if (error instanceof Error) {
            console.error(`[Message]: ${error.message}`);
            console.error(`[Stack]: ${error.stack}`);
        }
    }

    /**
     * Handle error with retry mechanism.
     * @param attempt - Current attempt number.
     * @param callback - The callback function to execute.
     */
    static async retryRequest(error: unknown, attempt: number, callback: () => Promise<any>): Promise<any> {
        this.logError(error);
        if (attempt < ERROR_CONFIG.MAX_RETRIES && error instanceof Error) {
            let interval;
            if (this.isRateLimitError(error)) {
                interval = ERROR_CONFIG.RATE_LIMIT_INTERVAL;
                console.log(`Rate limit exceeded, waiting for ${interval} ms before retrying.`);
            } else if (this.isNetworkError(error)) {
                interval = ERROR_CONFIG.NETWORK_ERROR_INTERVAL;
                console.log(`Network error, waiting for ${interval} ms before retrying.`);
            }else{
                throw error;
            }
            try {
                await new Promise(res => setTimeout(res, interval));
                return await callback();
            } catch (error) {
                console.log(`Retry attempt ${attempt + 1}`);
                return this.retryRequest(error, attempt + 1, callback);
            }            
        }
        return;
    }

    private static isRateLimitError(error: Error): boolean {
        return error.message.toLowerCase().includes(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED) || 
        (error as any).response?.status === 403;
    }
    
    private static isNetworkError(error: Error): boolean {
        return error.message.includes(ERROR_CODES.ECONNRESET) || error.message.includes(ERROR_CODES.ECONNABORTED);
    }
};