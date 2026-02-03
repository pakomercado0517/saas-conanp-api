import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
/**
 * Configuración base de OpenAPI para la documentación de la API
 */
export declare const registry: OpenAPIRegistry;
/**
 * Exportar la clase generadora para usarla dentro de generateOpenAPISpec
 */
export { OpenApiGeneratorV3 };
/**
 * Configuración base de la API
 */
export declare const apiConfig: {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
        contact: {
            name: string;
            email: string;
        };
    };
    servers: {
        url: string;
        description: string;
    }[];
    tags: {
        name: string;
        description: string;
    }[];
};
//# sourceMappingURL=config.d.ts.map