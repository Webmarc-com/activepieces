import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { t } from 'i18next';

import { useBuilderStateContext } from '@/app/builder/builder-hooks';
import { useEmbedding } from '@/components/embed-provider';
import { flowHooks } from '@/features/flows/lib/flow-hooks';
import { FlowStatusUpdatedResponse, FlowVersionState } from '@activepieces/shared';

/**
 * Hook that listens for commands from parent window (Surfsite) when embedded
 * Supports: SURFSITE_PUBLISH - triggers flow publish
 */
export function useEmbedCommands() {
  const { embedState } = useEmbedding();

  const [
    flowVersion,
    flow,
    setFlow,
    setVersion,
    isSaving,
    isPublishing,
    setIsPublishing,
  ] = useBuilderStateContext((state) => [
    state.flowVersion,
    state.flow,
    state.setFlow,
    state.setVersion,
    state.saving,
    state.isPublishing,
    state.setIsPublishing,
  ]);

  const isViewingDraft =
    flowVersion.state === FlowVersionState.DRAFT ||
    flowVersion.id === flow.publishedVersionId;
  const isPublishedVersion = flowVersion.id === flow.publishedVersionId;
  const canPublish = isViewingDraft && !isPublishedVersion && flowVersion.valid && !isSaving && !isPublishing;

  const { mutate: publish } = flowHooks.useChangeFlowStatus({
    flowId: flow.id,
    change: 'publish',
    onSuccess: (response: FlowStatusUpdatedResponse) => {
      setFlow(response.flow);
      setVersion(response.flow.version);
      toast.success(t('Your flow is now published.'), {
        duration: 3000,
      });
      // Notify parent window of success
      if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'SURFSITE_PUBLISH_RESULT',
            success: true,
            flowId: flow.id,
          },
          '*'
        );
      }
    },
    onError: (error: Error) => {
      // Notify parent window of error
      if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'SURFSITE_PUBLISH_RESULT',
            success: false,
            flowId: flow.id,
            error: error.message,
          },
          '*'
        );
      }
    },
    setIsPublishing: setIsPublishing,
  });

  // Send current publish state to parent
  const sendPublishState = useCallback(() => {
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'SURFSITE_PUBLISH_STATE',
          flowId: flow.id,
          canPublish,
          isPublishing,
          isSaving,
          isPublishedVersion,
          isValid: flowVersion.valid,
        },
        '*'
      );
    }
  }, [flow.id, canPublish, isPublishing, isSaving, isPublishedVersion, flowVersion.valid]);

  // Listen for commands from parent
  useEffect(() => {
    if (!embedState.isEmbedded) return;

    const handleMessage = (event: MessageEvent) => {
      // Handle publish command
      if (event.data?.type === 'SURFSITE_PUBLISH') {
        if (canPublish) {
          publish();
        } else {
          // Send back why we can't publish
          window.parent.postMessage(
            {
              type: 'SURFSITE_PUBLISH_RESULT',
              success: false,
              flowId: flow.id,
              error: isPublishedVersion
                ? 'Already published'
                : !flowVersion.valid
                ? 'Flow has incomplete steps'
                : isSaving
                ? 'Saving in progress'
                : isPublishing
                ? 'Publish already in progress'
                : 'Cannot publish',
            },
            '*'
          );
        }
      }

      // Handle state request
      if (event.data?.type === 'SURFSITE_GET_PUBLISH_STATE') {
        sendPublishState();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [embedState.isEmbedded, canPublish, publish, flow.id, isPublishedVersion, flowVersion.valid, isSaving, isPublishing, sendPublishState]);

  // Send state updates to parent when relevant state changes
  useEffect(() => {
    if (embedState.isEmbedded) {
      sendPublishState();
    }
  }, [embedState.isEmbedded, sendPublishState]);

  return null;
}
