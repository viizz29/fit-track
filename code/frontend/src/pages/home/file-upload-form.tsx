import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Stack,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { useMutation } from "@tanstack/react-query";
import { uploadFileApi } from "@/api/image-apis";

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file: File) =>
      uploadFileApi(file, (p) => setProgress(p)),
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleUpload = () => {
    if (!file) return;
    setProgress(0);
    mutation.mutate(file);
  };

  return (
    <Box maxWidth={420} mx="auto" mt={4}>
      <Stack spacing={2}>
        {/* Dropzone */}
        <Paper
          {...getRootProps()}
          sx={(theme) => ({
            p: 4,
            textAlign: "center",
            border: "2px dashed",
            borderColor: isDragActive
              ? theme.palette.primary.main
              : theme.palette.divider,
            cursor: "pointer",
            bgcolor: isDragActive
              ? theme.palette.action.hover
              : theme.palette.background.paper,
            transition: "all 0.2s ease",
          })}
        >
          <input {...getInputProps()} />

          <UploadFileIcon
            color={isDragActive ? "primary" : "disabled"}
            sx={{ fontSize: 40, mb: 1 }}
          />

          <Typography variant="h6">
            {isDragActive
              ? "Drop the file here..."
              : "Drag & drop a file"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            or click to browse
          </Typography>
        </Paper>

        {/* Selected file */}
        {file && (
          <Typography variant="body2">
            <strong>Selected:</strong> {file.name} (
            {Math.round(file.size / 1024)} KB)
          </Typography>
        )}

        {/* Upload button */}
        <LoadingButton
          variant="contained"
          fullWidth
          loading={mutation.isPending}
          disabled={!file}
          onClick={handleUpload}
        >
          Upload
        </LoadingButton>

        {/* Progress */}
        {mutation.isPending && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={progress}
            />
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {progress}%
            </Typography>
          </Box>
        )}

        {/* Success */}
        {mutation.isSuccess && (
          <Typography color="success.main">
            Upload successful!
          </Typography>
        )}

        {/* Error */}
        {mutation.isError && (
          <Typography color="error">
            Upload failed
          </Typography>
        )}
      </Stack>
    </Box>
  );
}