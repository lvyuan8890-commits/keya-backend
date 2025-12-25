export interface TranscriptResult {
    text: string;
    speakers?: Array<{
        speaker: string;
        text: string;
        timestamp?: string;
    }>;
}
export declare function speechToText(audioUrl: string): Promise<TranscriptResult>;
export declare function analyzeTeaching(transcript: string): Promise<any>;
//# sourceMappingURL=gemini.d.ts.map