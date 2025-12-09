import { useEmbedding } from '@/components/embed-provider';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar-shadcn';
import { ProjectSwitcher } from '@/features/projects/components/project-switcher';
import { flagsHooks } from '@/hooks/flags-hooks';
import { ApEdition, ApFlagId } from '@activepieces/shared';

export const AppSidebarHeader = () => {
  const { embedState } = useEmbedding();
  const { data: edition } = flagsHooks.useFlag<ApEdition>(ApFlagId.EDITION);
  const showSwitcher =
    edition !== ApEdition.COMMUNITY && !embedState.isEmbedded;

  return (
    <SidebarHeader className="relative" onClick={(e) => e.stopPropagation()}>
      <SidebarMenu>
        {showSwitcher && (
          <SidebarMenuItem>
            <ProjectSwitcher />
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarHeader>
  );
};
