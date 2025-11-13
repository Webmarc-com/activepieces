import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { b4aiUtilitiesAuth } from './lib/common/auth';
import { uploadFile } from './lib/actions/upload-file';
import { listFiles } from './lib/actions/list-files';
import { getFile } from './lib/actions/get-file';
import { downloadFile } from './lib/actions/download-file';
import { deleteFile } from './lib/actions/delete-file';

export const b4aiUtilities = createPiece({
  displayName: 'B4AI Utilities',
  description: 'File upload and management utilities for B4AI platform - Upload, download, list, and manage files in Google Cloud Storage',
  auth: b4aiUtilitiesAuth,
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'logo_white.svg',
  authors: ['B4AI Team'],
  categories: [PieceCategory.CONTENT_AND_FILES, PieceCategory.DEVELOPER_TOOLS],
  actions: [
    uploadFile,
    listFiles,
    getFile,
    downloadFile,
    deleteFile,
  ],
  triggers: [],
});
