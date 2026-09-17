/**
 * Centralized project configuration
 *
 * This file contains all project-specific settings that can be customized
 * for different projects. Environment variables can override these defaults.
 */

interface Config {
    api: {
        baseURL: string;
        baseUrl: string;
        tokenKey: string;
    };
    app: {
        name: string;
        version: string;
        environment: string;
    };
    features: {
        debug: boolean;
        logLevel: string;
    };
    sanctum: {
        statefulDomains: string;
    };
    websocket: {
        url: string;
        pusherAppKey: string;
        pusherAppCluster: string;
    };
    upload: {
        maxFileSize: number;
    };
}

const config: Config = {
    // API Configuration
    api: {
        baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api/v1/',
        baseUrl: (import.meta.env.VITE_BASE_URL as string) || 'http://localhost:5000',
        tokenKey: (import.meta.env.VITE_API_TOKEN_KEY as string) || 'auth_token',
    },

    // App Metadata
    app: {
        name: (import.meta.env.VITE_NAME as string) || 'React Application',
        version: (import.meta.env.VITE_VERSION as string) || '1.0.0',
        environment: (import.meta.env.VITE_ENV as string) || 'development',
    },

    // Feature Flags
    features: {
        debug: (import.meta.env.VITE_DEBUG as string) === 'true',
        logLevel: (import.meta.env.VITE_LOG_LEVEL as string) || 'info',
    },

    // Optional: Laravel Sanctum Configuration
    sanctum: {
        statefulDomains: (import.meta.env.VITE_SANCTUM_STATEFUL_DOMAINS as string) || '',
    },

    // Optional: WebSocket Configuration
    websocket: {
        url: (import.meta.env.VITE_WEBSOCKET_URL as string) || 'ws://localhost:6001',
        pusherAppKey: (import.meta.env.VITE_PUSHER_APP_KEY as string) || '',
        pusherAppCluster: (import.meta.env.VITE_PUSHER_APP_CLUSTER as string) || 'mt1',
    },

    // Optional: File Upload Configuration
    upload: {
        maxFileSize: parseInt((import.meta.env.VITE_MAX_FILE_SIZE as string) || '10485760'), // 10MB default
    },
};

export default config;