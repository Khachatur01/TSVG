import {PathCommand} from "./PathCommand";
import {Point} from "../Point";

export class Path {
  private commands: PathCommand[] = [];

  public get copy(): Path {
    let path: Path = new Path();
    this.commands.forEach(
      (command: PathCommand) => path.add(command.copy)
    );
    return path;
  }

  public get points(): Point[] {
    let points: Point[] = [];
    for (let command of this.commands)
      points.push(command.position);
    return points;
  }

  public get pointedCommands(): PathCommand[] {
    let commands: PathCommand[] = [];
    for (let command of this.commands)
      commands.push(command);
    return commands;
  }

  public getAll(): PathCommand[] {
    return this.commands;
  }
  public setAll(commands: PathCommand[]) {
    this.commands = commands;
  }

  public get(index: number): PathCommand {
    if (index < 0)
      index = this.commands.length + index;

    return this.commands[index];
  }
  public set(index: number, command: PathCommand) {
    if (index < 0)
      index = this.commands.length + index;

    this.commands[index] = command;
  }

  public add(command: PathCommand) {
    this.commands.push(command);
  }
  public remove(index: number) {
    let pointedCommands = this.pointedCommands;
    if (index < 0)
      index = pointedCommands.length + index;

    let command = pointedCommands[index];
    this.commands = this.commands.splice(this.commands.indexOf(command), 1);
  }

  public replace(index: number, point: Point) {
    let pointedCommands = this.pointedCommands;
    if (index < 0)
      index = pointedCommands.length + index;

    this.pointedCommands[index].position = point;
  }
  public replaceCommand(index: number, command: PathCommand) {
    if (index < 0)
      index = this.commands.length + index;

    this.commands[index] = command;
  }

  public toString(close: boolean = false): string {
    let result = "";
    for (let command of this.commands) {
      result += command.command + " ";
    }
    if (close)
      return result + "Z";
    else {
      return result.trimRight();
    }
  }
}
