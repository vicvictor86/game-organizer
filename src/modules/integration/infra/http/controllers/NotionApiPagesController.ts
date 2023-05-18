import { container } from 'tsyringe';
import { Request, Response } from 'express';
import { IndexPageNotionApiService } from '../../../services/IndexPageNotionApiService';

export default class NotionApiPagesController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const { pageId } = request.params;

    const indexPageNotionApiService = container.resolve(IndexPageNotionApiService);

    const page = await indexPageNotionApiService.execute({ userId: id, pageId });

    return response.status(200).json(page);
  }
}
