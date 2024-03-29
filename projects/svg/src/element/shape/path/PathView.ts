import {ElementCursor, ElementProperties, ElementView} from '../../ElementView';
import {Path} from '../../../model/path/Path';
import {Point} from '../../../model/Point';
import {Container} from '../../../Container';
import {PathCommand} from '../../../model/path/PathCommand';
import {LineTo} from '../../../model/path/line/LineTo';
import {ElementType} from '../../../dataSource/constant/ElementType';
import {Rect} from '../../../model/Rect';
import {ShapeView} from '../../type/ShapeView';
import {Line} from '../../../model/Line';

export class PathCursor extends ElementCursor {}

export interface PathProperties extends ElementProperties {}

export class PathView extends ShapeView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'path');
  protected override _type: ElementType = ElementType.PATH;

  /* Model */
  protected _path: Path = new Path();
  protected _lastPath: Path = new Path();
  /* Model */

  public constructor(container: Container, properties: PathProperties = {}, path: Path = new Path(), ownerId?: string, index?: number) {
    super(container, ownerId, index);

    this.svgElement.id = this.id;

    this.path = path;
    this.__fixRect__();

    this.setProperties(properties);
  }

  public override __updateView__(): void {
    this._rect = ElementView.calculateRect(this._path.points);
    this.setAttr({
      d: this._path.toString()
    });
  }

  public get path(): Path {
    return this._path;
  }
  public set path(path: Path) {
    this._path = path;
    this.__updateView__();
  }
  public get pathString(): string {
    return this._path.toString();
  }
  public set pathString(path: string) {
    this._path.fromString(path);
    this.__updateView__();
  }

  public override __fixRect__(): void {
    super.__fixRect__();
    this._lastPath = this._path.copy;
  }

  public get commands(): PathCommand[] {
    return this._path.getAll();
  }

  public override get points(): Point[] {
    return this._path.points;
  }
  public override set points(points: Point[]) {
    const commands: PathCommand[] = this._path.getAll();
    for (let i: number = 0; i < commands.length; i++) {
      commands[i].position = points[i];
    }
    this.__updateView__();
  }

  public override intersectsRect(rect: Rect): boolean {
    const points: Point[] = this.visiblePoints;
    return ElementView.pointsIntersectingRect(points, rect, false);
  }
  public override intersectsLine(line: Line): boolean {
    const points: Point[] = this.visiblePoints;
    return ElementView.pointsIntersectingSides(points, [line], false);
  }

  public addPath(path: Path): void {
    path.getAll().forEach((command: PathCommand) => {
      this._path.add(command);
    });
    this.__updateView__();
  }
  public addCommand(command: PathCommand): void {
    this._path.add(command);
    this._rect = this.calculateRectByNewPoint(command.position);

    this.__updateView__();
  }

  public override __correct__(refPoint: Point, lastRefPoint: Point): void {
    const delta: Point = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x === 0 && delta.y === 0) {
      return;
    }

    const commands: PathCommand[] = this._path.getAll();

    for (const command of commands) {
      command.position = {
        x: delta.x + command.position.x,
        y: delta.y + command.position.y
      };
    }
    this._path.setAll(commands);
    this.__updateView__();
  }
  public override __drag__(delta: Point): void {
    const lastCommands: PathCommand[] = this._lastPath.getAll();
    const thisCommands: PathCommand[] = this._path.getAll();

    for (let i: number = 0; i < lastCommands.length; i++) {
      thisCommands[i].position = {
        x: lastCommands[i].position.x + delta.x,
        y: lastCommands[i].position.y + delta.y
      };
    }

    this._path.setAll(thisCommands);
    this.__updateView__();
  }
  public override __setRect__(rect: Rect): void {
    let dw: number = 1;
    let dh: number = 1;

    if (this._lastRect.width !== 0) {
      dw = rect.width / this._lastRect.width;
    }
    if (this._lastRect.height !== 0) {
      dh = rect.height / this._lastRect.height;
    }

    const commands: PathCommand[] = this.commands;
    const lastCommands: PathCommand[] = this._lastPath.getAll();

    for (let i: number = 0; i < commands.length; i++) {
      /* points may not be fixed, and this._lastPoints[i] may be undefined */
      if (!lastCommands[i]) {
        lastCommands[i].position = {x: 0, y: 0};
      }

      commands[i].drag({x: dw, y: dh}, {x: rect.x, y: rect.y}, lastCommands[i]);
    }

    this._path = new Path();
    this._path.setAll(commands);
    this.__updateView__();
  }

  public getPoint(index: number): Point {
    return this._path.get(index).position;
  }
  public pushPoint(point: Point): void {
    this._path.add(new LineTo(point));
    this.__updateView__();
  }
  public replacePoint(index: number, point: Point): void {
    this._path.replace(index, point);
    this.__updateView__();
  }
  public removePoint(index: number): void {
    this._path.remove(index);
    this.__updateView__();
  }

  public override toPath(): PathView {
    return this;
  }

  public isComplete(): boolean {
    return this._path.getAll().length > 1;
  }

  public override toJSON(): any {
    const json: any = super.toJSON();
    json.path = this._path.toString();
    return json;
  }
  public override fromJSON(json: any): void {
    super.fromJSON(json);
    const path: Path = new Path();
    path.fromString(json.path);
    this.path = path;
  };
}
