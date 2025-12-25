export interface UploadResult {
    url: string;
    key: string;
    size: number;
}
export declare function uploadFile(fileBuffer: Buffer, originalName: string, contentType: string): Promise<UploadResult>;
export declare function deleteFile(key: string): Promise<boolean>;
export declare function getFileUrl(key: string, expires?: number): Promise<string>;
export declare function deleteFiles(keys: string[]): Promise<boolean>;
//# sourceMappingURL=storage.d.ts.map