import { container } from 'tsyringe';
import { Request, Response } from 'express';
import { IndexUserAvailablePagesNotionApiService } from '../../../services/IndexNotionApiService';

export default class NotionApiController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;

    const indexUserAvailablePagesNotionApiService = container.resolve(IndexUserAvailablePagesNotionApiService);

    const pages = await indexUserAvailablePagesNotionApiService.execute({ userId: id });

    return response.status(200).json(pages);
  }
}
