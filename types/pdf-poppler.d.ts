// File: types/pdf-poppler.d.ts
declare module 'pdf-poppler' {
    interface ConvertOptions {
        format?: 'jpeg' | 'png' | 'tiff';
        out_dir?: string;
        out_prefix?: string;
        page?: number | null;
        resolution?: number;
        scale?: number;
        jpegFile?: boolean;
    }

    export class Converter {
        static convert(pdfPath: string, options: ConvertOptions): Promise<void>;
    }
}
