import { getEnvLiteralTypeValue, getEnvNum, getEnvStr, getPemKey } from "./env.private";
import { TALGORITHM } from "src/constants/types/t.algorithm";

export interface IJwt_Env {
    JWT_ACCESS_EXPIRED_IN: string;

    JWT_PRIVATE_PEM_KEY: string;
    JWT_PUBLIC_PEM_KEY: string;
    JWT_PASSPHRASE: string;
    JWT_ALGOIRHTM: TALGORITHM;
}

export interface IMARIA_ENV {
    HOST: string;
    PORT: number;
    USER: string;
    PWD: string;
    DB_NAME: string;
    DB_CONNECTION_LIMIT: number;
}

export class Env {

    PORT: number;

    SALT: number;

    SITE_URL: string;

    JWT: IJwt_Env;

    MARIA_ENV: IMARIA_ENV;
    
    constructor() {

        this.PORT = getEnvNum('PORT');
        this.SITE_URL = getEnvStr('SITE_URL');

        this.SALT = getEnvNum('SALT');

        this.JWT = {
            JWT_ACCESS_EXPIRED_IN: getEnvStr('JWT_ACCESS_EXPIRED_IN'),
            JWT_PRIVATE_PEM_KEY: getPemKey('secrets/jwt.private'),
            JWT_PUBLIC_PEM_KEY: getPemKey('secrets/jwt.public'),
            JWT_PASSPHRASE: getEnvStr('JWT_PASSPHRASE'),
            JWT_ALGOIRHTM: getEnvLiteralTypeValue('JWT_ALGOIRHTM')
        }
    }

}