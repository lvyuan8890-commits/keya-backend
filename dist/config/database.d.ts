import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare function testConnection(): Promise<boolean>;
export declare function query<T = any>(sql: string, params?: any[]): Promise<T[]>;
export declare function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
export declare function insert(sql: string, params?: any[]): Promise<number>;
export declare function update(sql: string, params?: any[]): Promise<number>;
export declare function remove(sql: string, params?: any[]): Promise<number>;
export declare function transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T>;
export default pool;
//# sourceMappingURL=database.d.ts.map