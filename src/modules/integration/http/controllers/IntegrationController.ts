import { container } from "tsyringe";
import { Request, Response } from "express";
import axios from "axios";
import { UserObjectResponse } from '@notionhq/client/build/src/api-endpoints';

interface NotionResponse {
  access_token: string;
  owner: UserObjectResponse;
  workspace_id: string;
  bot_id: string;  
}

export default class GameController {
  // public async create(request: Request, response: Response): Promise<Response> {
  //   const { title } = request.body;
  //   const createGameService = container.resolve(CreateGameService);

  //   const gameInformation = await createGameService.execute(title);

  //   return response.status(200).json(gameInformation);
  // }

  public async index(request: Request, response: Response): Promise<Response> {
    const { code } = request.params;

    const notionResponse = await axios.post<NotionResponse>('https://api.notion.com/v1/oauth/token', {
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.CLIENT_ID_OAUTH,
    });

    const { access_token, owner, workspace_id, bot_id } = notionResponse.data;

    //Salvar no banco de dados as infos acima

    return response.status(200).json({ message: {code, access_token, owner, workspace_id, bot_id }});
  }
}