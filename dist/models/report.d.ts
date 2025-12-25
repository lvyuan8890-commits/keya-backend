export interface Report {
    id: string;
    recording_id: string;
    user_id: string;
    transcript: string | null;
    analysis: any | null;
    teacher_speech_rate: number | null;
    student_participation: number | null;
    interaction_quality: number | null;
    content_structure: number | null;
    overall_score: number | null;
    suggestions: string | null;
    status: 'processing' | 'completed' | 'failed';
    created_at: Date;
    updated_at: Date;
}
export interface CreateReportData {
    recording_id: string;
    user_id: string;
}
export interface UpdateReportData {
    transcript?: string;
    analysis?: any;
    teacher_speech_rate?: number;
    student_participation?: number;
    interaction_quality?: number;
    content_structure?: number;
    overall_score?: number;
    suggestions?: string;
    status?: Report['status'];
}
export declare function createReport(data: CreateReportData): Promise<Report>;
export declare function findReportById(id: string): Promise<Report | null>;
export declare function findReportByRecordingId(recordingId: string): Promise<Report | null>;
export declare function findReportsByUserId(userId: string, limit?: number, offset?: number): Promise<Report[]>;
export declare function updateReport(id: string, data: UpdateReportData): Promise<Report | null>;
export declare function deleteReport(id: string): Promise<boolean>;
export declare function getReportCount(userId?: string): Promise<number>;
//# sourceMappingURL=report.d.ts.map