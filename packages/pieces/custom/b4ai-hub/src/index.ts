import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { knowledgeHubAuth } from './lib/common/auth';
import { listKnowledgeHubs } from './lib/actions/list-knowledge-hubs';
import { getKnowledgeHub } from './lib/actions/get-knowledge-hub';
import { createKnowledgeHub } from './lib/actions/create-knowledge-hub';
import { updateKnowledgeHub } from './lib/actions/update-knowledge-hub';
import { deleteKnowledgeHub } from './lib/actions/delete-knowledge-hub';
import { syncSchema } from './lib/actions/sync-schema';
import { getSchemaJson } from './lib/actions/get-schema-json';
import { regenerateMetadata } from './lib/actions/regenerate-metadata';

export const b4aiHub = createPiece({
  displayName: 'B4AI Hub',
  description: 'Manage graph-based knowledge hubs with schema synchronization and LLM metadata generation',
  auth: knowledgeHubAuth,
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'logo_purple.svg',
  authors: ['B4AI Team'],
  categories: [PieceCategory.ARTIFICIAL_INTELLIGENCE, PieceCategory.DEVELOPER_TOOLS],
  actions: [
    // CRUD Operations
    listKnowledgeHubs,
    getKnowledgeHub,
    createKnowledgeHub,
    updateKnowledgeHub,
    deleteKnowledgeHub,
    // Schema Management
    syncSchema,
    getSchemaJson,
    regenerateMetadata,
  ],
  triggers: [],
});
