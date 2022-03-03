import {ElementView} from "../../ElementView";
import {Path} from "../../../model/path/Path";
import {Point} from "../../../model/Point";
import {Size} from "../../../model/Size";
import {TSVG} from "../../../TSVG";
import {PathCommand} from "../../../model/path/PathCommand";
import {Close} from "../../../model/path/close/Close";
import {PointedView} from "./PointedView";
import {Rect} from "../../../model/Rect";
import {LineTo} from "../../../model/path/line/LineTo";

export class PathView extends PointedView {
  protected _size: Size = {width: 0, height: 0};
  protected _path: Path;
  protected _lastPath: Path;

  public constructor(container: TSVG, path: Path = new Path()) {
    super(container);
    this.svgElement = document.createElementNS(ElementView.svgURI, "path");
    this.svgElement.id = this.id;

    this._path = path;
    this._lastPath = path;
    this.setAttr({
      d: this._path.toString()
    })
    this.setOverEvent();
    try {
      this.style.setDefaultStyle();
    } catch (error: any) {
    }
  }

  public get path(): Path {
    return this._path;
  }
  public set path(path: Path) {
    this._path = path;
    this.setAttr({
      d: path.toString()
    })
  }

  public get copy(): PathView {
    let path: PathView = new PathView(this._container);
    path.path = this._path.copy;
    path.fixRect();

    path.refPoint = Object.assign({}, this.refPoint);
    path.rotate(this._angle);

    path.style.set = this.style;

    return path;
  }

  public override fixRect() {
    super.fixRect();
    this.fixPath();
    this._lastPoints = this._lastPath.points;
  }
  public fixPath() {
    this._lastPath = this._path.copy;
  }

  public isComplete(): boolean {
    let size = this.size;
    return size.width != 0 && size.height != 0;
  }

  public get commands(): PathCommand[] {
    return this._path.getAll();
  }

  public override get points(): Point[] {
    return this._path.points;
  }
  public override set points(points: Point[]) {
    let commands = this._path.getAll();
    for (let i = 0; i < commands.length; i++)
      commands[i].position = points[i];

    this.setAttr({
      d: this._path.toString()
    });
  }

  public override get position(): Point {
    let commands = this._path.getAll();
    let leftTop: Point = Object.assign({}, commands[0].position);

    for (let i = 1; i < commands.length; i++) {
      if (commands[i] instanceof Close) continue;

      if (commands[i].position.x < leftTop.x)
        leftTop.x = commands[i].position.x;
      if (commands[i].position.y < leftTop.y)
        leftTop.y = commands[i].position.y;
    }
    return leftTop;
  }
  public override set position(delta: Point) {
    let lastCommands = this._lastPath.getAll();
    let thisCommands = this._path.getAll();

    for (let i = 0; i < lastCommands.length; i++) {
      thisCommands[i].position = {
        x: lastCommands[i].position.x + delta.x,
        y: lastCommands[i].position.y + delta.y
      }
    }

    this._path.setAll(thisCommands);

    this.setAttr({
      d: this._path.toString()
    });
  }

  public override get size(): Size {
    let commands = this._path.getAll();
    /* get copy, not reference */
    let min = Object.assign({}, commands[0].position);
    let max = Object.assign({}, commands[0].position);

    for (let i = 1; i < commands.length; i++) {
      if (commands[i] instanceof Close) continue;

      if (commands[i].position.x < min.x)
        min.x = commands[i].position.x
      if (commands[i].position.y < min.y)
        min.y = commands[i].position.y

      if (commands[i].position.x > max.x)
        max.x = commands[i].position.x
      if (commands[i].position.y > max.y)
        max.y = commands[i].position.y
    }

    this._size = {
      width: max.x - min.x,
      height: max.y - min.y
    };

    return this._size;
  }
  public override setSize(rect: Rect) { //FIXME
    let dw = 1;
    let dh = 1;

    if (this._lastSize.width != 0)
      dw = rect.width / this._lastSize.width;
    if (this._lastSize.height != 0)
      dh = rect.height / this._lastSize.height;


    let commands = this.commands;
    for (let i = 0; i < commands.length; i++) {
      /* points may not be fixed, and this._lastPoints[i] may be undefined */
      if (!this._lastPoints[i])
        this._lastPoints[i] = {x: 0, y: 0};

      commands[i].position.x = rect.x + Math.abs(this._lastPoints[i].x - rect.x) * dw;
      commands[i].position.y = rect.y + Math.abs(this._lastPoints[i].y - rect.y) * dh;
    }

    this._path = new Path();
    this._path.setAll(commands);

    this.setAttr({
      d: this._path.toString()
    });
  }

  public add(path: PathView) {
    path.commands.forEach((command: PathCommand) => {
      this._path.add(command);
    });

    this.setAttr({
      d: this._path.toString()
    });
  }
  public addCommand(command: PathCommand) {
    this._path.add(command);

    this.setAttr({
      d: this._path.toString()
    });
  }

  public getPoint(index: number): Point {
    return this._path.get(index).position;
  }
  public pushPoint(point: Point): void {
    this._path.add(new LineTo(point));

    this.setAttr({
      d: this._path.toString()
    });
  }
  public replacePoint(index: number, point: Point): void {
    this._path.replace(index, point);

    this.setAttr({
      d: this._path.toString()
    });
  }
  public removePoint(index: number): void {
    this._path.remove(index);

    this.setAttr({
      d: this._path.toString()
    });
  }

  public override toPath(): PathView {
    return this;
  }
}
