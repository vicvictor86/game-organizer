export interface ICreateNotionUserConnectionDTO {
  accessToken: string;
  userId: string;
  botId: string;
  duplicateTemplateId?: string;
  ownerId: string;
  gameDatabaseId: string;
  platformDatabaseId: string;
  workspaceIcon?: string;
  workspaceId: string;
  workspaceName?: string;
}