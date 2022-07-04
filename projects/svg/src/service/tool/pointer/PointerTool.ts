import {Tool} from "../Tool";
import {Container} from "../../../Container";
import {Event} from "../../../dataSource/constant/Event";
import {Point} from "../../../model/Point";
import {Cursor} from "../../../dataSource/constant/Cursor";
import {PathView} from "../../../element/shape/PathView";
import {Path} from "../../../model/path/Path";

export class PointerTool extends Tool {
  protected override _cursor: Cursor = Cursor.POINTER;
  private _pointerPath: PathView;
  private _isVisible: boolean = false;

  private _move = this.move.bind(this);

  public constructor(container: Container, path?: Path) {
    super(container);
    this._pointerPath = new PathView(this._container, {}, path);
  }

  public makeMouseDown(position: Point, call: boolean = true) {}
  public makeMouseMove(position: Point, call: boolean = true) {
    this._pointerPath.__translate__(position);

    if (call) {
      this._container.__call__(Event.POINTER_MOVE, {position: position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {}

  public getStrokeWidth(): string {
    return this._pointerPath.style.strokeWidth;
  }
  public setStrokeWidth(width: string, call: boolean = true) {
    this._pointerPath.style.strokeWidth = width;
    if (call) {
      this._container.__call__(Event.POINTER_STROKE_WIDTH_CHANGE, {strokeWidth: width});
    }
  }
  public getStrokeDasharray(): string {
    return this._pointerPath.style.strokeDashArray;
  }
  public setStrokeDasharray(dashArray: string, call: boolean = true) {
    this._pointerPath.style.strokeDashArray = dashArray;
    if (call) {
      this._container.__call__(Event.POINTER_STROKE_DASH_ARRAY_CHANGE, {strokeDashArray: dashArray});
    }
  }
  public getStrokeColor(): string {
    return this._pointerPath.style.strokeColor;
  }
  public setStrokeColor(color: string, call: boolean = true) {
    this._pointerPath.style.strokeColor = color;
    if (call) {
      this._container.__call__(Event.POINTER_STROKE_COLOR_CHANGE, {strokeColor: color});
    }
  }
  public getFillColor(): string {
    return this._pointerPath.style.fillColor;
  }
  public setFillColor(color: string, call: boolean = true) {
    this._pointerPath.style.fillColor = color;
    if (call) {
      this._container.__call__(Event.POINTER_FILL_COLOR_CHANGE, {fillColor: color});
    }
  }

  public get isVisible(): boolean {
    return this._isVisible;
  }

  public add() {
    this._container.__pointersGroup__.appendChild(this._pointerPath.SVG);
    this._isVisible = true;
  }

  public remove() {
    try {
      this._container.__pointersGroup__.removeChild(this._pointerPath.SVG);
      this._isVisible = false;
    } catch (e) {}
  }

  public getPath(): Path {
    return this._pointerPath.path;
  }
  public setPath(path: Path, call: boolean = true) {
    this._pointerPath = new PathView(this._container, {}, path);

    if (call) {
      this._container.__call__(Event.POINTER_CHANGE, {pathView: path});
    }
  }
  private move(event: TouchEvent | MouseEvent): void {
    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    event.stopImmediatePropagation();

    let movePosition = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(movePosition);
  }

  public override on(call: boolean = true): void {
    super.on(call);
    this.add();
    this._container.HTML.addEventListener("touchmove", this._move);
    this._container.HTML.addEventListener("mousemove", this._move);
    this._container.blur();

    this._container.style.changeCursor(this.cursor);
    if (call) {
      this._container.__call__(Event.POINTER_TOOl_ON);
    }
  }
  public override off(call: boolean = true): void {
    super.off();
    this.remove();
    this._container.HTML.removeEventListener("touchmove", this._move);
    this._container.HTML.removeEventListener("mousemove", this._move);

    if (call) {
      this._container.__call__(Event.POINTER_TOOl_OFF);
    }
  }
}
