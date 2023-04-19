import { Request, Response } from "express";
import { container } from "tsyringe";
import CreateGameService from "../../services/CreateGameService";

export default class GameController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { title } = request.body;

    const auth = request.headers.authorization;
    
    if (!auth) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const [bearer, token] = auth.split(" ");

    if (!token) {
      return response.status(401).json({ message: "Unauthorized" });
    }
    
    const createGameService = container.resolve(CreateGameService);

    const gameInformation = await createGameService.execute(title, token);

    return response.status(200).json(gameInformation);
  }

  public async index(request: Request, response: Response): Promise<Response> {
    return response.status(200).json({ message: "Hello World" });
  }

}