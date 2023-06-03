import { container } from 'tsyringe';
import { Request, Response } from 'express';
import { ShowPagesNotionApiService } from '../../../services/ShowPagesNotionApiService';

export default class NotionPagesController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;

    const showPagesNotionApiService = container.resolve(ShowPagesNotionApiService);

    const pages = await showPagesNotionApiService.execute({ userId: id });

    return response.status(200).json(pages);
  }
}
