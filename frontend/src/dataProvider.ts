import type { BaseRecord, CustomParams, CustomResponse, DataProvider } from "@refinedev/core";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api").replace(/\/+$/, "");

async function readJsonSafe(resp: Response): Promise<unknown> {
    const text = await resp.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

function buildUrl(path: string): string {
    if (path.startsWith("http")) return path;
    if (!path.startsWith("/")) path = `/${path}`;
    return `${API_BASE_URL}${path}`;
}

// GET /professionals?source=direct|partner|internal&include_resume=true
function listUrl(resource: string, filters?: any[], includeResume?: boolean): string {
    const url = new URL(buildUrl(`/${resource}/`));
    const sourceFilter = (filters ?? []).find((f) => f?.field === "source" && f?.operator === "eq");

    if (sourceFilter?.value)
        url.searchParams.set("source", String(sourceFilter.value));

    if (includeResume)
        url.searchParams.set("include_resume", "true");

    return url.toString();
}

export const dataProvider: DataProvider = {
    getList: async ({ resource, filters, meta }) => {
        const resp = await fetch(listUrl(resource, filters, Boolean(meta?.includeResume)), {
            method: "GET",
            headers: { Accept: "application/json" },
        });

        if (!resp.ok) {
            const body = await readJsonSafe(resp);
            throw new Error(`GET /${resource} failed: ${resp.status} ${JSON.stringify(body)}`);
        }

        const data: any = await readJsonSafe(resp);

        const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

        return { data: list, total: list.length };
    },

    create: async ({ resource, variables }) => {
        const resp = await fetch(buildUrl(`/${resource}/`), {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(variables ?? {}),
        });

        const body = await readJsonSafe(resp);

        if (!resp.ok) {
            throw new Error(`POST /${resource} failed: ${resp.status} ${JSON.stringify(body)}`);
        }

        return { data: body as any };
    },

    // used for /professionals/bulk and /professionals/:id/resume
    custom: async <
        TData extends BaseRecord = BaseRecord,
        TQuery = unknown,
        TPayload = unknown,
    >({
        url,
        method,
        headers,
        payload,
        query,
    }: CustomParams<TQuery, TPayload>): Promise<CustomResponse<TData>> => {
        const u = new URL(buildUrl(url));

        if (query && typeof query === "object") {
            Object.entries(query).forEach(([k, v]) => {
                if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
            });
        }

        const finalHeaders: HeadersInit = headers ? { ...headers } : {};
        let body: BodyInit | null | undefined = payload as BodyInit | null | undefined;

        if (payload && typeof payload === "object" && !(payload instanceof FormData)) {
            if (!("Content-Type" in (finalHeaders as Record<string, string>))) {
                (finalHeaders as Record<string, string>)["Content-Type"] = "application/json";
            }
            body = JSON.stringify(payload);
        }

        const resp = await fetch(u.toString(), {
            method: method ?? "GET",
            headers: finalHeaders,
            body,
        });

        const data = await readJsonSafe(resp);

        if (!resp.ok) {
            throw new Error(`${method ?? "GET"} ${url} failed: ${resp.status} ${JSON.stringify(data)}`);
        }

        return { data: data as TData };
    },

    // not needed for this prototype
    getOne: async () => {
        throw new Error("Not implemented");
    },
    update: async () => {
        throw new Error("Not implemented");
    },
    deleteOne: async () => {
        throw new Error("Not implemented");
    },
    getMany: async () => {
        throw new Error("Not implemented");
    },
    createMany: async () => {
        throw new Error("Not implemented");
    },
    updateMany: async () => {
        throw new Error("Not implemented");
    },
    deleteMany: async () => {
        throw new Error("Not implemented");
    },
    getApiUrl: () => API_BASE_URL,
};
