import { useMemo, useState } from "react";
import { useCustomMutation, useNotification } from "@refinedev/core";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import type { Professional } from "../../types";

type Props = {
    open: boolean;
    professional: Professional | null;
    onClose: () => void;
};

export function ResumeUploadDialog({ open, professional, onClose }: Props) {
    const { open: notify } = useNotification();
    const { mutateAsync, isLoading } = useCustomMutation();
    const [file, setFile] = useState<File | null>(null);

    const title = useMemo(() => {
        if (!professional) return "Upload Resume";
        return `Upload Resume (PDF) — ${professional.full_name} (#${professional.id})`;
    }, [professional]);

    async function onUpload() {
        if (!professional) return;

        if (!file) {
            notify?.({
                type: "error",
                message: "Please choose a .pdf file.",
            });
            return;
        }

        if (file.type !== "application/pdf") {
            notify?.({
                type: "error",
                message: "Only .pdf files are allowed.",
            });
            return;
        }

        const form = new FormData();

        // IMPORTANT: Backend expects -F "file=@..."
        form.append("file", file);

        try {
            const response = await mutateAsync({
                url: `/professionals/${professional.id}/resume`,
                method: "post",
                values: form,
            });

            notify?.({
                type: "success",
                message: "Resume uploaded successfully.",
            });

            console.log("Upload response:", response?.data);

            setFile(null);
            onClose();
        } catch (e) {
            notify?.({
                type: "error",
                message: "Upload failed",
                description: (e as Error).message,
            });
        }
    }

    return (
        <Dialog
            open={open}
            onClose={isLoading ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Stack gap={2} mt={1}>
                    <Typography variant="body2" color="text.secondary">
                        Backend: POST /api/professionals/{professional?.id ?? "<id>"}/resume
                        (multipart/form-data, field name: "file")
                    </Typography>

                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        disabled={isLoading}
                    />

                    {file && (
                        <Typography variant="body2">
                            Selected: <b>{file.name}</b> ({Math.round(file.size / 1024)} KB)
                        </Typography>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>

                <Button
                    onClick={onUpload}
                    variant="contained"
                    disabled={isLoading || !file}
                >
                    {isLoading ? "Uploading..." : "Upload"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
