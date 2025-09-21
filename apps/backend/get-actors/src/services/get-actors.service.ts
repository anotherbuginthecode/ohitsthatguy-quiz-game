import { Actor } from "../types";

export class ActorService {
  public async getRandomActors(db: any, count: number = 3): Promise<Actor[]> {
    const collection = db.collection("actors");
    const actors = await collection
      .aggregate([{ $sample: { size: count } }])
      .toArray();
    return actors.map((doc: Actor) => doc as Actor);
  }
}
