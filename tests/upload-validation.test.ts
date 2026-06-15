import { describe, expect, it } from 'vitest';
import {
  MAX_UPLOAD_SIZE_BYTES,
  isUploadFileTooLarge,
} from '../lib/upload-validation';

describe('upload file size validation', () => {
  it('accepts a file smaller than 50 MB', () => {
    expect(isUploadFileTooLarge(MAX_UPLOAD_SIZE_BYTES - 1)).toBe(false);
  });

  it('accepts a file exactly 50 MB', () => {
    expect(isUploadFileTooLarge(MAX_UPLOAD_SIZE_BYTES)).toBe(false);
  });

  it('rejects a file larger than 50 MB', () => {
    expect(isUploadFileTooLarge(MAX_UPLOAD_SIZE_BYTES + 1)).toBe(true);
  });
});
