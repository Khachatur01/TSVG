import {PathCommand} from "../PathCommand";

export class Close extends PathCommand {
  constructor() {
    super({x: 0, y: 0});
  }

  get command(): string {
    return "Z";
  }

  get copy(): PathCommand {
    return new Close();
  }

}
