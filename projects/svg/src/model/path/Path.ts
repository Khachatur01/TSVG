import {PathCommand} from './PathCommand';
import {Point} from '../Point';
import {MoveTo} from './point/MoveTo';
import {LineTo} from './line/LineTo';
import {HLineTo} from './line/oriented/HLineTo';
import {VLineTo} from './line/oriented/VLineTo';
import {CBezier} from './curve/bezier/cubic/CBezier';
import {SCBezier} from './curve/bezier/cubic/SCBezier';
import {QBezier} from './curve/bezier/quadratic/QBezier';
import {SQBezier} from './curve/bezier/quadratic/SQBezier';
import {Arc} from './curve/arc/Arc';

export class Path {
  private commands: PathCommand[] = [];

  public get copy(): Path {
    const path: Path = new Path();
    this.commands.forEach((command: PathCommand) =>
      path.add(command.copy)
    );
    return path;
  }

  public get points(): Point[] {
    const points: Point[] = [];
    for (const command of this.commands) {
      points.push(command.position);
    }
    return points;
  }

  public getAll(): PathCommand[] {
    return this.commands;
  }
  public setAll(commands: PathCommand[]): void {
    this.commands = commands;
  }

  public get(index: number): PathCommand {
    if (index < 0) {
      index = this.commands.length + index;
    }

    return this.commands[index];
  }
  public set(index: number, command: PathCommand): void {
    if (index < 0) {
      index = this.commands.length + index;
    }

    this.commands[index] = command;
  }

  public add(command: PathCommand): void {
    this.commands.push(command);
  }
  public addAll(commands: PathCommand[]): void {
    commands.forEach((command: PathCommand) => {
      this.commands.push(command);
    });
  }
  public addPath(path: Path): void {
    path.commands.forEach((command: PathCommand) => {
      this.commands.push(command);
    });
  }
  public remove(index: number): void {
    if (index < 0) {
      index = this.commands.length + index;
    }

    const command: PathCommand = this.commands[index];
    this.commands = this.commands.splice(this.commands.indexOf(command), 1);
  }

  public replace(index: number, point: Point): void {
    if (index < 0) {
      index = this.commands.length + index;
    }

    this.commands[index].position = point;
  }
  public replaceCommand(index: number, command: PathCommand): void {
    if (index < 0) {
      index = this.commands.length + index;
    }

    this.commands[index] = command;
  }

  public toString(close: boolean = false): string {
    let result: string = '';
    for (const command of this.commands) {
      result += command.toString() + ' ';
    }
    if (close) {
      return result + 'Z';
    } else {
      return result.trimEnd();
    }
  }
  public fromString(pathString: string): void {
    this.commands = [];

    const pathArray: IterableIterator<RegExpMatchArray> = pathString
      .replace(/\s*,\s*/g, ' ')
      .matchAll(/[MmLlHhVvCcSsQqTtAaZz][\s.\-\d]*/g);

    for (const commandString of pathArray) {
      const commandArray: string[] = commandString.toString().trim().split(' ');

      switch (commandArray[0]) {
        case 'M':
        case 'm':
          const moveTo: MoveTo = new MoveTo({
            x: parseFloat(commandArray[1]),
            y: parseFloat(commandArray[2])
          });
          this.add(moveTo);
          break;

        case 'L':
        case 'l':
          const lineTo: LineTo = new LineTo({
            x: parseFloat(commandArray[1]),
            y: parseFloat(commandArray[2])
          });
          this.add(lineTo);
          break;

        case 'H':
        case 'h':
          const hLineTo: HLineTo = new HLineTo({
            x: parseFloat(commandArray[1]),
            y: 0
          });
          this.add(hLineTo);
          break;

        case 'V':
        case 'v':
          const vLineTo: VLineTo = new VLineTo({
            x: 0,
            y: parseFloat(commandArray[1])
          });
          this.add(vLineTo);
          break;

        case 'C':
        case 'c':
          const cBezier: CBezier = new CBezier({
            x: parseFloat(commandArray[1]),
            y: parseFloat(commandArray[2])
          },{
            x: parseFloat(commandArray[3]),
            y: parseFloat(commandArray[4])
          },{
            x: parseFloat(commandArray[5]),
            y: parseFloat(commandArray[6])
          });
          this.add(cBezier);
          break;

        case 'S':
        case 's':
          const sCBezier: SCBezier = new SCBezier({
            x: parseFloat(commandArray[1]),
            y: parseFloat(commandArray[2])
          },{
            x: parseFloat(commandArray[3]),
            y: parseFloat(commandArray[4])
          });
          this.add(sCBezier);
          break;

        case 'Q':
        case 'q':
          const qBezier: QBezier = new QBezier({
            x: parseFloat(commandArray[1]),
            y: parseFloat(commandArray[2])
          },{
            x: parseFloat(commandArray[3]),
            y: parseFloat(commandArray[4])
          });
          this.add(qBezier);
          break;

        case 'T':
        case 't':
          const sQBezier: SQBezier = new SQBezier({
            x: parseFloat(commandArray[1]),
            y: parseFloat(commandArray[2])
          });
          this.add(sQBezier);
          break;

        case 'A':
        case 'a':
          const arc: Arc = new Arc(
            parseFloat(commandArray[1]),
            parseFloat(commandArray[2]),
            parseFloat(commandArray[3]),
            parseFloat(commandArray[4]),
            parseFloat(commandArray[5]), {
            x: parseFloat(commandArray[6]),
            y: parseFloat(commandArray[7])
          });
          this.add(arc);
          break;

        case 'Z':
        case 'z':
          this.commands[this.commands.length - 1].close = true;
          break;
      }
    }
  }
}
