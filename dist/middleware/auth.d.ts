import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                openid: string;
                nickname?: string;
                role: 'user' | 'admin';
            };
            userId?: string;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function adminMiddleware(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map