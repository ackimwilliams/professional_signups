import { useMemo, useState } from "react";
import { type CrudFilter, useList } from "@refinedev/core";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Professional, ProfessionalSource } from "../../types";
import { ResumeUploadDialog } from "./resumeUploadDialog";

export function ProfessionalsList() {
    const navigate = useNavigate();
    const [source, setSource] = useState<ProfessionalSource | "all">("all");
    const [resumeTarget, setResumeTarget] = useState<Professional | null>(null);
    const [resumeViewer, setResumeViewer] = useState<{ name: string; url: string } | null>(null);

    const filters: CrudFilter[] = useMemo(() => {
        if (source === "all") return [];
        return [{ field: "source", operator: "eq", value: source } as const];
    }, [source]);

    const { data, isLoading, isError, error } = useList<Professional>({
        resource: "professionals",
        filters,
        meta: { includeResume: true },
    });

    const list: Professional[] = (data?.data ?? []) as Professional[];

    return (
        <Box p={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Professionals</Typography>
                <Stack direction="row" gap={1}>
                    <Button variant="outlined" onClick={() => navigate("/professionals/bulk")}>
                        Bulk Upsert
                    </Button>
                    <Button variant="contained" onClick={() => navigate("/professionals/new")}>
                        New Professional
                    </Button>
                </Stack>
            </Stack>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Stack direction="row" gap={2} alignItems="center" flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 240 }}>
                            <InputLabel id="source-label">Filter by source</InputLabel>
                            <Select
                                labelId="source-label"
                                value={source}
                                label="Filter by source"
                                onChange={(e) => setSource(e.target.value as any)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="direct">direct</MenuItem>
                                <MenuItem value="partner">partner</MenuItem>
                                <MenuItem value="internal">internal</MenuItem>
                            </Select>
                        </FormControl>

                        <Typography variant="body2" color="text.secondary">
                            Backend: GET /api/professionals{source !== "all" ? `?source=${source}` : ""}
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>

            {isLoading && (
                <Stack alignItems="center" mt={6}>
                    <CircularProgress />
                </Stack>
            )}

            {isError && (
                <Card>
                    <CardContent>
                        <Typography color="error" variant="subtitle1">
                            Failed to load professionals
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {(error as { message?: string })?.message ?? "Unknown error"}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !isError && (
                <Stack gap={2}>
                    {list.map((p) => (
                        <Card key={p.id}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                                    <Box>
                                        <Typography variant="h6">{p.full_name}</Typography>
                                        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" mt={0.5}>
                                            <Chip size="small" label={p.source} />
                                            {p.email ? <Typography variant="body2">{p.email}</Typography> : null}
                                            {p.phone ? <Typography variant="body2">{p.phone}</Typography> : null}
                                            {p.company_name ? <Typography variant="body2">{p.company_name}</Typography> : null}
                                            {p.job_title ? <Typography variant="body2">{p.job_title}</Typography> : null}
                                        </Stack>

                                        {p.resume_summary ? (
                                            <Typography variant="body2" color="text.secondary" mt={1} sx={{ whiteSpace: "pre-wrap" }}>
                                                {p.resume_summary.length > 240
                                                    ? `${p.resume_summary.slice(0, 240).trim()}…`
                                                    : p.resume_summary}
                                            </Typography>
                                        ) : null}
                                    </Box>

                                    <Stack direction="row" gap={1}>
                                        {p.resume_url ? (
                                            <Button
                                                variant="outlined"
                                                onClick={() =>
                                                    setResumeViewer({
                                                        name: p.full_name,
                                                        url: p.resume_url ?? "",
                                                    })
                                                }
                                            >
                                                View Resume
                                            </Button>
                                        ) : null}
                                        <Button variant="outlined" onClick={() => setResumeTarget(p)}>
                                            Upload Resume (PDF)
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}

                    {list.length === 0 && <Typography color="text.secondary">No professionals found.</Typography>}
                </Stack>
            )}

            <ResumeUploadDialog
                open={!!resumeTarget} professional={resumeTarget}
                onClose={() => setResumeTarget(null)}
            />
            <Dialog
                open={!!resumeViewer}
                onClose={() => setResumeViewer(null)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Resume — {resumeViewer?.name}</DialogTitle>
                <DialogContent sx={{ height: "70vh" }}>
                    {resumeViewer?.url ? (
                        <iframe
                            title={`Resume for ${resumeViewer.name}`}
                            src={resumeViewer.url}
                            style={{ border: "none", width: "100%", height: "100%" }}
                        />
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No resume available.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    {resumeViewer?.url ? (
                        <Button
                            variant="outlined"
                            onClick={() => window.open(resumeViewer.url, "_blank", "noopener,noreferrer")}
                        >
                            Open in new tab
                        </Button>
                    ) : null}
                    <Button onClick={() => setResumeViewer(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
