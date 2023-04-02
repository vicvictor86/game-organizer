import { container } from "tsyringe";
import { IAPIConsumer } from "../../interfaces/IAPIConsumer";
import { APIConsumer } from "../../apis/APIConsumer";

container.registerSingleton<IAPIConsumer>('APIConsumer', APIConsumer);