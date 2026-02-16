import { useMemo, useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { BulkResult } from "../../types";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

//@todo: consider moving to types files
type BulkProfessionalDraft = {
    full_name: string;
    email?: string;
    phone?: string;
    company_name?: string;
    job_title?: string;
    source: "direct" | "partner" | "internal";
};

const starterRows: BulkProfessionalDraft[] = [
    {
        full_name: "",
        email: "",
        phone: "",
        company_name: "",
        job_title: "",
        source: "direct",
    },
];

function pretty(obj: unknown): string {
    return JSON.stringify(obj, null, 2);
}

function normalize(rows: BulkProfessionalDraft[]): BulkProfessionalDraft[] {
    return rows.map((row) => ({
        full_name: row.full_name.trim(),
        email: row.email?.trim() || undefined,
        phone: row.phone?.trim() || undefined,
        company_name: row.company_name?.trim() || undefined,
        job_title: row.job_title?.trim() || undefined,
        source: row.source,
    }));
}

function statusChip(status: string) {
    const s = status.toLowerCase();

    if (s === "failed")
        return <Chip size="small" label="failed" color="error" />;

    if (s === "created")
        return <Chip size="small" label="created" color="success" />;

    if (s === "updated")
        return <Chip size="small" label="updated" color="info" />;

    return <Chip size="small" label={status} />;
}

export function ProfessionalsBulk() {
    const navigate = useNavigate();
    const { mutateAsync, isLoading } = useCustomMutation();

    const [rows, setRows] = useState<BulkProfessionalDraft[]>(starterRows);
    const [result, setResult] = useState<BulkResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const payload = useMemo(() => normalize(rows), [rows]);

    const fieldSx = useMemo(() => ({ backgroundColor: "#fff" }), []);

    async function onSubmit() {
        setError(null);
        setResult(null);

        const valid = payload.filter((row) => row.full_name && row.source);
        if (valid.length === 0) {
            // basic validation
            setError("Add at least one row with a full name and source.");
            return;
        }

        try {
            const res = await mutateAsync({
                url: "/professionals/bulk",
                method: "post",
                config: { headers: { Accept: "application/json" } },
                values: valid,
            });

            setResult(res.data as BulkResult);
        } catch (e) {
            setError((e as Error).message);
        }
    }

    return (
        <Box p={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Bulk Upsert Professionals</Typography>
                <Button variant="outlined" onClick={() => navigate("/professionals")}>
                    Back
                </Button>
            </Stack>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Backend: POST /api/professionals/bulk
                    </Typography>

                    <Stack gap={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">Professionals</Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={() =>
                                    setRows((prev) => [
                                        ...prev,
                                        {
                                            full_name: "",
                                            email: "",
                                            phone: "",
                                            company_name: "",
                                            job_title: "",
                                            source: "direct",
                                        },
                                    ])
                                }
                            >
                                Add Row
                            </Button>
                        </Stack>

                        <Stack gap={1.5}>
                            {rows.map((row, index) => (
                                <Card
                                    key={index}
                                    variant="outlined"
                                    sx={{ backgroundColor: "#fafafa" }}
                                >
                                    <CardContent>
                                        <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems="flex-start">
                                            <Stack flex={1} gap={1.5}>
                                                <TextField
                                                    label="Full name"
                                                    value={row.full_name}
                                                    sx={fieldSx}
                                                    onChange={(e) =>
                                                        setRows((prev) =>
                                                            prev.map((draft, i) =>
                                                                i === index ? { ...draft, full_name: e.target.value } : draft,
                                                            ),
                                                        )
                                                    }
                                                    required
                                                />
                                                <TextField
                                                    label="Email"
                                                    value={row.email ?? ""}
                                                    sx={fieldSx}
                                                    onChange={(e) =>
                                                        setRows((prev) =>
                                                            prev.map((draft, i) =>
                                                                i === index ? { ...draft, email: e.target.value } : draft,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <TextField
                                                    label="Phone"
                                                    value={row.phone ?? ""}
                                                    sx={fieldSx}
                                                    onChange={(e) =>
                                                        setRows((prev) =>
                                                            prev.map((draft, i) =>
                                                                i === index ? { ...draft, phone: e.target.value } : draft,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </Stack>

                                            <Stack flex={1} gap={1.5}>
                                                <TextField
                                                    label="Company name"
                                                    value={row.company_name ?? ""}
                                                    sx={fieldSx}
                                                    onChange={(e) =>
                                                        setRows((prev) =>
                                                            prev.map((draft, i) =>
                                                                i === index ? { ...draft, company_name: e.target.value } : draft,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <TextField
                                                    label="Job title"
                                                    value={row.job_title ?? ""}
                                                    sx={fieldSx}
                                                    onChange={(e) =>
                                                        setRows((prev) =>
                                                            prev.map((draft, i) =>
                                                                i === index ? { ...draft, job_title: e.target.value } : draft,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <FormControl>
                                                    <InputLabel id={`source-${index}`}>Source</InputLabel>
                                                    <Select
                                                        labelId={`source-${index}`}
                                                        label="Source"
                                                        value={row.source}
                                                        sx={fieldSx}
                                                        onChange={(e) =>
                                                            setRows((prev) =>
                                                                prev.map((draft, i) =>
                                                                    i === index ? { ...draft, source: e.target.value as any } : draft,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <MenuItem value="direct">direct</MenuItem>
                                                        <MenuItem value="partner">partner</MenuItem>
                                                        <MenuItem value="internal">internal</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Stack>

                                            <IconButton
                                                aria-label="Remove row"
                                                onClick={
                                                () => setRows((prev) => prev.filter((_, i) => i !== index))}
                                                disabled={rows.length === 1}
                                            >
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>

                        {error ? (
                            <Typography color="error" sx={{ whiteSpace: "pre-wrap" }}>
                                {error}
                            </Typography>
                        ) : null}

                        <Button variant="contained" onClick={onSubmit} disabled={isLoading}>
                            {isLoading ? "Submitting..." : "Submit Bulk"}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {result ? (
                <Card>
                    <CardContent>
                        <Typography variant="h6">Result</Typography>

                        <Divider sx={{ my: 2 }} />

                        <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                            <Card variant="outlined" sx={{ flex: 1 }}>
                                <CardContent>
                                    <Typography variant="subtitle2">Summary</Typography>
                                    <Stack direction="row" gap={1} mt={1} flexWrap="wrap">
                                        <Chip label={`created: ${result.created}`} color="success" variant="outlined" />
                                        <Chip label={`updated: ${result.updated}`} color="info" variant="outlined" />
                                        <Chip label={`failed: ${result.failed}`} color="error" variant="outlined" />
                                        <Chip label={`total: ${result.results?.length ?? 0}`} variant="outlined" />
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Card variant="outlined" sx={{ flex: 1 }}>
                                <CardContent>
                                    <Typography variant="subtitle2">Notes</Typography>
                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        renders per-item status from <code>results[]</code>
                                        and show error strings when present.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" gutterBottom>
                            Per-item results
                        </Typography>

                        <Stack gap={1}>
                            {(result.results ?? []).map((bulkResultItem) => (
                                <Card key={bulkResultItem.index} variant="outlined">
                                    <CardContent>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle2">Index: {bulkResultItem.index}</Typography>
                                            {statusChip(String(bulkResultItem.status))}
                                        </Stack>

                                        {bulkResultItem.error ? (
                                            <Typography
                                                variant="body2"
                                                color="error"
                                                sx={{ whiteSpace: "pre-wrap", mt: 1 }}
                                            >
                                                {bulkResultItem.error}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                no error
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2">Raw response</Typography>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{pretty(result)}</pre>
                    </CardContent>
                </Card>
            ) : null}
        </Box>
    );
}
