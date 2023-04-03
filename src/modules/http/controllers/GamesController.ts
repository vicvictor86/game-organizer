import { container } from "tsyringe";
import { Request, Response } from "express";
import CreateGameService from "../../services/CreateGameService";

export default class GameController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { title } = request.body;
    const createGameService = container.resolve(CreateGameService);

    const gameInformation = await createGameService.execute(title);

    return response.status(200).json(gameInformation);
  }

  public async index(request: Request, response: Response): Promise<Response> {
    return response.status(200).json({ message: "Hello World" });
  }

  // public async show(request: Request, response: Response): Promise<Response> {
  //   const showAlternativeService = container.resolve(ShowAlternativeService);

  //   const alternatives = await showAlternativeService.execute();

  //   return response.status(200).json(instanceToInstance(alternatives));
  // }

}