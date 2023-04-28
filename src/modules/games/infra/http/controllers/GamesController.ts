import { Request, Response } from "express";
import { container } from "tsyringe";
import CreateGameService from "../../../services/CreateGameService";


export default class GameController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { title } = request.body;
    const { id } = request.user;

    const createGameService = container.resolve(CreateGameService);

    console.log("entrou")
    const gameInformation = await createGameService.execute(title, id);

    return response.status(200).json(gameInformation);
  }

  public async index(request: Request, response: Response): Promise<Response> {
    return response.status(200).json({ message: "Hello World" });
  }

}