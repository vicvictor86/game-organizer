import { Request, Response } from 'express';
import { container } from 'tsyringe';
import CreateGameService from '../../../services/CreateGameService';
import IndexGameService from '../../../services/IndexGameService';

export default class GameController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { title, pageId } = request.body;
    const { id } = request.user;

    const createGameService = container.resolve(CreateGameService);

    const gameInformation = await createGameService.execute({ title, userId: id, pageId });

    return response.status(200).json(gameInformation);
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const { gameTitle } = request.params;

    const indexGameService = container.resolve(IndexGameService);

    const gameInformation = await indexGameService.execute({ gameTitle });

    return response.status(200).json(gameInformation);
  }
}
