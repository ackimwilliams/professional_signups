import React, { useState } from "react";
import { useCreate } from "@refinedev/core";
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { ProfessionalSource } from "../../types";

export function ProfessionalCreate() {
    const navigate = useNavigate();
    const { mutateAsync, isLoading } = useCreate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [source, setSource] = useState<ProfessionalSource>("direct");
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        try {
            await mutateAsync({
                resource: "professionals",
                values: {
                    full_name: fullName,
                    email: email || null,
                    phone: phone || null,
                    company_name: companyName || null,
                    job_title: jobTitle || null,
                    source,
                },
            });
            navigate("/professionals");
        } catch (err) {
            setError((err as Error)?.message ?? "Failed");
        }
    }

    return (
        <Box p={2} maxWidth={720}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Create Professional</Typography>
                <Button variant="outlined" onClick={() => navigate("/professionals")}>
                    Back
                </Button>
            </Stack>

            <Card>
                <CardContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Backend: POST /api/professionals
                    </Typography>

                    <Box component="form" onSubmit={onSubmit}>
                        <Stack gap={2}>
                            <TextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            <TextField label="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            <TextField label="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />

                            <FormControl>
                                <InputLabel id="source-create-label">Source</InputLabel>
                                <Select
                                    labelId="source-create-label"
                                    label="Source"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value as any)}
                                >
                                    <MenuItem value="direct">direct</MenuItem>
                                    <MenuItem value="partner">partner</MenuItem>
                                    <MenuItem value="internal">internal</MenuItem>
                                </Select>
                            </FormControl>

                            {error ? (
                                <Typography color="error" sx={{ whiteSpace: "pre-wrap" }}>
                                    {error}
                                </Typography>
                            ) : null}

                            <Button type="submit" variant="contained" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Create"}
                            </Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
