import type { WorkspaceRole } from '../../types'

export const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: 'владелец',
  editor: 'редактор',
  viewer: 'наблюдатель',
}
