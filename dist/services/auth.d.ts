export interface Session {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    created_at: Date;
}
export declare function generateToken(userId: string): string;
export declare function verifyToken(token: string): {
    userId: string;
} | null;
export declare function createSession(userId: string): Promise<{
    token: string;
    session: Session;
}>;
export declare function validateSession(token: string): Promise<string | null>;
export declare function deleteSession(token: string): Promise<boolean>;
export declare function cleanExpiredSessions(): Promise<number>;
//# sourceMappingURL=auth.d.ts.map