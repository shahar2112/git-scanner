import { ERROR_CODES, ERROR_MESSAGES } from "../configs/scannerConfig.js";
import { ErrorUtils } from "./errorUtils.js";

/**
 * Utility class for API-related operations.
 */
export class ApiUtils {
    static getAuthHeader(token: string): string {
        return `token ${token}`;
    }
        
    static validateToken(token: any) {
        if (!token) {
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.NO_AUTH_TOKEN, ERROR_CODES.UNAUTHENTICATED, 401);
        }
        if (typeof token !== 'string' || !token.trim()) {
            throw ErrorUtils.createGraphQLError(ERROR_MESSAGES.INVALID_AUTH_TOKEN, ERROR_CODES.UNAUTHORIZED, 403);
        }
    }
}