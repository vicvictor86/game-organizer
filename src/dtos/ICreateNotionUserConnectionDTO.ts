export interface ICreateNotionUserConnectionDTO {
  accessToken: string;
  botId: string;
  duplicateTemplateId?: string;
  ownerId: string;
  workspaceIcon?: string;
  workspaceId: string;
  workspaceName?: string;
}