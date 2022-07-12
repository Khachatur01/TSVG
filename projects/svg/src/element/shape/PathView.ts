import {ElementCursor, ElementView} from "../ElementView";
import {Path} from "../../model/path/Path";
import {Point} from "../../model/Point";
import {Container} from "../../Container";
import {PathCommand} from "../../model/path/PathCommand";
import {LineTo} from "../../model/path/line/LineTo";
import {ElementType} from "../../dataSource/constant/ElementType";
import {Rect} from "../../model/Rect";
import {ShapeView} from "../type/ShapeView";
import {ElementProperties} from "../../model/ElementProperties";

export class PathCursor extends ElementCursor {}

export class PathView extends ShapeView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "path");
  protected override _type: ElementType = ElementType.PATH;

  /* Model */
  protected _path: Path = new Path();
  protected _lastPath: Path = new Path();
  /* Model */

  public constructor(container: Container, properties: ElementProperties = {}, path: Path = new Path(), ownerId?: string, index?: number) {
    super(container, ownerId, index);

    this.svgElement.id = this.id;

    this.path = path;
    this.__fixRect__();

    this.setProperties(properties);
  }

  protected override __updateView__() {
    this.setAttr({
      d: this._path.toString()
    });
  }

  public get path(): Path {
    return this._path;
  }
  public set path(path: Path) {
    this._path = path;

    this._rect = ElementView.calculateRect(path.points);
    this.__updateView__();
  }
  public get pathString(): string {
    return this._path.toString();
  }
  public set pathString(path: string) {
    this._path.fromString(path);
    this._rect = ElementView.calculateRect(this._path.points);
  }

  public get copy(): PathView {
    let path: PathView = new PathView(this._container, this._properties);
    path.path = this._path.copy;
    path.__fixRect__();

    path.refPoint = Object.assign({}, this.refPoint);
    path.__rotate__(this._angle);

    path.style.set = this.style;

    return path;
  }

  public override __fixRect__() {
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
    let commands = this._path.getAll();
    for (let i = 0; i < commands.length; i++) {
      commands[i].position = points[i];
    }

    this._rect = ElementView.calculateRect(points);
    this.__updateView__();
  }

  public addPath(path: Path) {
    path.getAll().forEach((command: PathCommand) => {
      this._path.add(command);
    });

    this._rect = ElementView.calculateRect(path.points);
    this.__updateView__();
  }
  public addCommand(command: PathCommand) {
    this._path.add(command);
    this._rect = this.calculateRectByNewPoint(command.position);

    this.__updateView__();
  }

  public override __correct__(refPoint: Point, lastRefPoint: Point) {
    let delta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;

    let commands = this._path.getAll();

    for (let command of commands) {
      command.position = {
        x: delta.x + command.position.x,
        y: delta.y + command.position.y
      };
    }
    this._path.setAll(commands);
    this._rect = ElementView.calculateRect(this._path.points);
    this.__updateView__();
  }
  public override __drag__(delta: Point) {
    let lastCommands = this._lastPath.getAll();
    let thisCommands = this._path.getAll();

    for (let i = 0; i < lastCommands.length; i++) {
      thisCommands[i].position = {
        x: lastCommands[i].position.x + delta.x,
        y: lastCommands[i].position.y + delta.y
      }
    }

    this._path.setAll(thisCommands);
    this._rect = ElementView.calculateRect(this._path.points);
    this.__updateView__();
  }
  public override __setRect__(rect: Rect, delta?: Point): void {
    let dw = 1;
    let dh = 1;

    if (this._lastRect.width != 0)
      dw = rect.width / this._lastRect.width;
    if (this._lastRect.height != 0)
      dh = rect.height / this._lastRect.height;

    let commands = this.commands;
    let lastPoints = this._lastPath.points;

    for (let i = 0; i < commands.length; i++) {
      /* points may not be fixed, and this._lastPoints[i] may be undefined */
      if (!lastPoints[i])
        lastPoints[i] = {x: 0, y: 0};

      commands[i].position = {
        x: rect.x + Math.abs(lastPoints[i].x - rect.x) * dw,
        y: rect.y + Math.abs(lastPoints[i].y - rect.y) * dh
      };
    }

    this._path = new Path();
    this._path.setAll(commands);
    this._rect = ElementView.calculateRect(this._path.points);
    this.__updateView__();
  }

  public getPoint(index: number): Point {
    return this._path.get(index).position;
  }
  public pushPoint(point: Point): void {
    this._path.add(new LineTo(point));
    this._rect = ElementView.calculateRect(this._path.points);
    this.__updateView__();
  }
  public replacePoint(index: number, point: Point): void {
    this._path.replace(index, point);
    this._rect = ElementView.calculateRect(this._path.points);
    this.__updateView__();
  }
  public removePoint(index: number): void {
    this._path.remove(index);
    this._rect = ElementView.calculateRect(this._path.points);
    this.__updateView__();
  }

  public override toPath(): PathView {
    return this;
  }

  public isComplete(): boolean {
    return this._path.getAll().length > 1;
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json["path"] = this._path.toString();
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    let path = new Path();
    path.fromString(json.path)
    this.path = path;
  };
}
