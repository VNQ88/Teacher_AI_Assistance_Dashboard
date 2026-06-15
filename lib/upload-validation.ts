export const MAX_UPLOAD_SIZE_MB = 50;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
export const FILE_TOO_LARGE_MESSAGE = `File size must not exceed ${MAX_UPLOAD_SIZE_MB} MB`;

export const isUploadFileTooLarge = (fileSizeBytes: number) =>
  fileSizeBytes > MAX_UPLOAD_SIZE_BYTES;
