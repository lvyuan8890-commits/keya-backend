export interface Recording {
    id: string;
    user_id: string;
    title: string;
    duration: number;
    file_size: number;
    file_url: string;
    status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
    created_at: Date;
    updated_at: Date;
}
export interface CreateRecordingData {
    user_id: string;
    title: string;
    duration: number;
    file_size: number;
    file_url: string;
}
export declare function createRecording(data: CreateRecordingData): Promise<Recording>;
export declare function findRecordingById(id: string): Promise<Recording | null>;
export declare function findRecordingsByUserId(userId: string, limit?: number, offset?: number): Promise<Recording[]>;
export declare function updateRecordingStatus(id: string, status: Recording['status']): Promise<boolean>;
export declare function updateRecording(id: string, data: Partial<Pick<Recording, 'title' | 'duration' | 'file_size' | 'file_url'>>): Promise<Recording | null>;
export declare function deleteRecording(id: string): Promise<boolean>;
export declare function getRecordingCount(userId?: string): Promise<number>;
//# sourceMappingURL=recording.d.ts.map