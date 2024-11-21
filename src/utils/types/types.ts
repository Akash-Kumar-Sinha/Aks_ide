export interface RepositoryInfo {
  id: string;
  name: string;
  techStack: string;
  description: string;
  profileId: string;
  createdAt: string;
}

export enum SidebarTabs {
  EXPLORER,
  GIT,
  DOCUMENT
}
