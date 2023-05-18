/* eslint-disable camelcase */
import { container } from 'tsyringe';
import { Request, Response } from 'express';
import axios from 'axios';
import { CreateNotionUserConnectionService } from '../../../services/CreateNotionUserConnectionService';
import { IndexIntegrationInfoService } from '../../../services/IndexIntegrationInfoService';

interface NotionResponse {
  access_token: string;
  owner: {
    user: {
      object: string;
      id: string;
    }
  };
  workspace_id: string;
  bot_id: string;

  token_type?: string;
  workspace_name?: string;
  workspace_icon?: string;
  duplicated_template_id?: string;
}

export default class IntegrationController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { code } = request.query;
    const { id } = request.user;

    const createNotionUserConnectionService = container.resolve(CreateNotionUserConnectionService);

    const notionResponse = await axios.post<NotionResponse>(
      'https://api.notion.com/v1/oauth/token',
      {
        grant_type: 'authorization_code',
        code,
      },
      {
        auth: { username: process.env.NOTION_CLIENT_ID_OAUTH || '', password: process.env.NOTION_CLIENT_SECRET_OAUTH || '' },
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const {
      access_token, owner, workspace_id, bot_id, duplicated_template_id, token_type, workspace_icon, workspace_name,
    } = notionResponse.data;

    const notionUserConnection = await createNotionUserConnectionService.execute({
      accessToken: access_token,
      ownerId: owner.user.id,
      workspaceId: workspace_id,
      botId: bot_id,
      duplicatedTemplateId: duplicated_template_id,
      workspaceIcon: workspace_icon,
      workspaceName: workspace_name,
      userId: id,
    });

    return response.status(200).json(notionUserConnection);
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;

    const indexIntegrationInfoService = container.resolve(IndexIntegrationInfoService);

    const integrationInfo = await indexIntegrationInfoService.execute({ userId: id });

    return response.status(200).json(integrationInfo);
  }
}
