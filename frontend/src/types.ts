export type ProfessionalSource = "direct" | "partner" | "internal";

export type Professional = {
    id: number;
    full_name: string;
    email?: string | null;
    phone?: string | null;
    company_name?: string | null;
    job_title?: string | null;
    source: ProfessionalSource;
    resume_url?: string | null;
    resume_summary?: string | null;
};

export type BulkResultItem = {
    index: number;
    status: "created" | "updated" | "failed" | string;
    error?: string;
    // temporary future proof, incase I want to add more fields in the backend
    [k: string]: unknown;
};

export type BulkResult = {
    created: number;
    updated: number;
    failed: number;
    results: BulkResultItem[];
    [k: string]: unknown;
};
