import {PathCommand} from "./PathCommand";
import {Point} from "../Point";
import {MoveTo} from "./point/MoveTo";
import {LineTo} from "./line/LineTo";
import {HLineTo} from "./line/oriented/HLineTo";
import {VLineTo} from "./line/oriented/VLineTo";
import {CBezier} from "./curve/bezier/cubic/CBezier";
import {SCBezier} from "./curve/bezier/cubic/SCBezier";
import {QBezier} from "./curve/bezier/quadratic/QBezier";
import {SQBezier} from "./curve/bezier/quadratic/SQBezier";
import {Arc} from "./curve/arc/Arc";
import {Close} from "./close/Close";

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
  public fromString(pathString: string) {
    this.commands = [];

    let pathArray = pathString
      .replace(/\s*,\s*/g, " ")
      .matchAll(/[MmLlHhVvCcSsQqTtAaZz][\s.\d]*/g);

    for (let commandString of pathArray) {
      let commandArray = commandString.toString().trim().split(" ");
      switch (commandArray[0]) {
        case "M":
        case "m":
          let moveTo = new MoveTo({
            x: parseInt(commandArray[1]),
            y: parseInt(commandArray[2])
          });
          this.add(moveTo);
          break;

        case "L":
        case "l":
          let lineTo = new LineTo({
            x: parseInt(commandArray[1]),
            y: parseInt(commandArray[2])
          });
          this.add(lineTo);
          break;

        case "H":
        case "h":
          let hLineTo = new HLineTo({
            x: parseInt(commandArray[1]),
            y: 0
          });
          this.add(hLineTo);
          break;

        case "V":
        case "v":
          let vLineTo = new VLineTo({
            x: 0,
            y: parseInt(commandArray[1])
          });
          this.add(vLineTo);
          break;

        case "C":
        case "c":
          let cBezier = new CBezier({
            x: parseInt(commandArray[1]),
            y: parseInt(commandArray[2])
          },{
            x: parseInt(commandArray[3]),
            y: parseInt(commandArray[4])
          },{
            x: parseInt(commandArray[5]),
            y: parseInt(commandArray[6])
          });
          this.add(cBezier);
          break;

        case "S":
        case "s":
          let sCBezier = new SCBezier({
            x: parseInt(commandArray[1]),
            y: parseInt(commandArray[2])
          },{
            x: parseInt(commandArray[3]),
            y: parseInt(commandArray[4])
          });
          this.add(sCBezier);
          break;

        case "Q":
        case "q":
          let qBezier = new QBezier({
            x: parseInt(commandArray[1]),
            y: parseInt(commandArray[2])
          },{
            x: parseInt(commandArray[3]),
            y: parseInt(commandArray[4])
          });
          this.add(qBezier);
          break;

        case "T":
        case "t":
          let sQBezier = new SQBezier({
            x: parseInt(commandArray[1]),
            y: parseInt(commandArray[2])
          });
          this.add(sQBezier);
          break;

        case "A":
        case "a":
          let arc = new Arc(
            parseInt(commandArray[1]),
            parseInt(commandArray[2]),
            parseInt(commandArray[3]),
            parseInt(commandArray[4]),
            parseInt(commandArray[5]), {
            x: parseInt(commandArray[6]),
            y: parseInt(commandArray[7])
          });
          this.add(arc);
          break;

        case "Z":
        case "z":
          let close = new Close();
          this.add(close);
          break;
      }
    }
  }
}
