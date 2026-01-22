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

  const { mutateAsync: publishAsync } = flowHooks.useChangeFlowStatus({
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
    setIsPublishing: setIsPublishing,
  });

  // Wrapper to handle errors and notify parent
  const publish = useCallback(async () => {
    try {
      await publishAsync();
    } catch (error) {
      // Notify parent window of error
      if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'SURFSITE_PUBLISH_RESULT',
            success: false,
            flowId: flow.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          '*'
        );
      }
    }
  }, [publishAsync, flow.id]);

  // Send current publish state to parent
  const sendPublishState = useCallback(() => {
    if (window.parent !== window) {
      console.log('[useEmbedCommands] Sending publish state:', { canPublish, isPublishing, isSaving, isPublishedVersion, isValid: flowVersion.valid });
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

  // Check if we're inside an iframe (parent communication possible)
  const isInIframe = window.parent !== window;

  // Listen for commands from parent
  useEffect(() => {
    console.log('[useEmbedCommands] Setup effect, isEmbedded:', embedState.isEmbedded, 'isInIframe:', isInIframe);

    // Listen for messages if embedded OR in iframe (to support both modes)
    if (!embedState.isEmbedded && !isInIframe) {
      console.log('[useEmbedCommands] Not embedded and not in iframe, skipping message listener');
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      console.log('[useEmbedCommands] Received message:', event.data?.type, event.data);

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
  }, [embedState.isEmbedded, isInIframe, canPublish, publish, flow.id, isPublishedVersion, flowVersion.valid, isSaving, isPublishing, sendPublishState]);

  // Send state updates to parent when relevant state changes
  useEffect(() => {
    if (embedState.isEmbedded || isInIframe) {
      sendPublishState();
    }
  }, [embedState.isEmbedded, isInIframe, sendPublishState]);

  return null;
}
