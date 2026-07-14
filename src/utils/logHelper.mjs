import logger from "./logger.mjs";

export const appLog = (message) => {
    logger.info(`[APPLICATION] ${message}`);
};

export const dbLog = (message) => {
    logger.info(`[DATABASE] ${message}`);
};

export const serverLog = (message) => {
    logger.info(`[SERVER] ${message}`);
};

export const requestLog = (message) => {
    logger.info(`[REQUEST] ${message}`);
};

export const securityLog = (message) => {
    logger.warn(`[SECURITY] ${message}`);
};

export const ldapLog = (message) => {
    logger.info(`[LDAP] ${message}`);
};