import { container } from 'tsyringe';
import { Request, Response } from 'express';
import { CreateNotionTablePagesAndDatabasesService } from '../../../services/CreateNotionTablePagesAndDatabasesService';

export default class NotionTablePagesAndDatabasesController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;

    const createNotionTablePagesAndDatabasesService = container.resolve(CreateNotionTablePagesAndDatabasesService);

    const pages = await createNotionTablePagesAndDatabasesService.execute({ userId: id });

    return response.status(200).json(pages);
  }
}
