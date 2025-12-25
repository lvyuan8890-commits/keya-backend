export interface User {
    id: string;
    openid: string;
    nickname?: string;
    avatar_url?: string;
    phone?: string;
    email?: string;
    role: 'user' | 'admin';
    created_at: Date;
    updated_at: Date;
}
export interface CreateUserData {
    openid: string;
    nickname?: string;
    avatar_url?: string;
    phone?: string;
    email?: string;
}
export declare function findUserByOpenid(openid: string): Promise<User | null>;
export declare function findUserById(id: string): Promise<User | null>;
export declare function createUser(data: CreateUserData): Promise<User>;
export declare function updateUser(id: string, data: Partial<CreateUserData>): Promise<User | null>;
export declare function getUserStats(userId: string): Promise<{
    recording_count: any;
    report_count: any;
    total_duration: any;
}>;
//# sourceMappingURL=user.d.ts.map