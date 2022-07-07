import {Container} from "../../../../../../Container";
import {MoveTo} from "../../../../../../model/path/point/MoveTo";
import {Arc} from "../../../../../../model/path/curve/arc/Arc";
import {LineTo} from "../../../../../../model/path/line/LineTo";
import {PathView} from "../../../../../../element/shape/PathView";
import {Point} from "../../../../../../model/Point";
import {Event} from "../../../../../../dataSource/constant/Event";
import {Focus} from "../../../Focus";
import {Cursor} from "../../../../../../dataSource/constant/Cursor";

export class RefPoint extends PathView {
  private readonly _r: number = 5; /* radius */
  private _lastCenter: Point = {x: 0, y: 0};
  private _center: Point = {x: 0, y: 0};
  private focus: Focus;

  private moving: boolean = false;
  private _start = this.start.bind(this);
  private _move = this.move.bind(this);
  private _end = this.end.bind(this);

  public constructor(container: Container, focus: Focus, x: number = 0, y: number = 0) {
    super(container, {});
    this.style.fillColor = "transparent";
    this.style.strokeColor = "#002fff";
    this.style.strokeWidth = "0.5";

    this._center = {x: x, y: y};
    this.drawPoint(this._center);
    this.focus = focus;

    this.svgElement.style.display = "none";
    this.svgElement.style.cursor = this._container.style.cursor[Cursor.REFERENCE_POINT];
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    this.focus.__fixRect__();
    this.focus.__fixRefPoint__();
    this._lastRect = Object.assign({}, this._rect);

    position = this._container.grid.getSnapPoint(position);
    this.focus.__refPointView__ = Object.assign({}, position);

    if (call) {
      this._container.__call__(Event.REF_POINT_VIEW_MOUSE_DOWN, {position: position, elements: this.focus.children});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    position = this._container.grid.getSnapPoint(position);
    this.focus.__refPointView__ = Object.assign({}, position);

    if (call) {
      this._container.__call__(Event.REF_POINT_VIEW_MOUSE_MOVE, {position: position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    this.makeMouseMove(position);
    let refPoint = this._container.grid.getSnapPoint(position);
    this.focus.__refPoint__ = refPoint;
    this.focus.__correct__(refPoint);
    if (call) {
      this._container.__call__(Event.REF_POINT_VIEW_MOUSE_UP, {position: position});
      this._container.__call__(Event.REF_POINT_CHANGED, {newRefPoint: refPoint, oldRefPoint: this.focus.__lastRefPoint__, elements: this.focus.children});
    }
  }

  public __fixPosition__() {
    this._lastCenter = this._center;
  }
  public get __lastPosition__(): Point {
    return this._lastCenter;
  }
  public set __lastPosition__(refPoint: Point) {
    this._lastCenter = refPoint;
  }
  public __setPosition__(position: Point) {
    this._center = position;
    this.drawPoint(position);
  }

  public get r(): number {
    return this._r;
  }

  private drawPoint(point: Point): void {
    let x = point.x;
    let y = point.y;
    this._path.setAll([
      new MoveTo({x: x - this._r, y: y}),
      new Arc(this._r, this._r, 0, 0, 1, {x: x + this._r, y: y}),
      new Arc(this._r, this._r, 0, 0, 1, {x: x - this._r, y: y}),
      new MoveTo({x: x - this._r - this._r / 2, y: y}),
      new LineTo({x: x + this._r + this._r / 2, y: y}),
      new MoveTo({x: x, y: y - this._r - this._r / 2}),
      new LineTo({x: x, y: y + this._r + this._r / 2})
    ]);
    this.setAttr({
      d: this._path.toString()
    });
  }

  public __show__() {
    this.svgElement.style.display = "block";
  }
  public __hide__() {
    this.svgElement.style.display = "none";
  }

  private start(event: MouseEvent | TouchEvent) {
    this._container.tools.activeTool?.off();
    this._container.HTML.addEventListener("mousemove", this._move);
    this._container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);
    this.moving = true;

    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    let containerRect = this._container.HTML.getBoundingClientRect();
    let position = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    }
    this.makeMouseDown(position);
  }
  private move(event: MouseEvent | TouchEvent) {
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    let containerRect = this._container.HTML.getBoundingClientRect();
    let position = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    }
    this.makeMouseMove(position);
  }
  private end(event: MouseEvent | TouchEvent) {
    this._container.tools.activeTool?.on();
    if (!this.moving) return;

    this._container.HTML.removeEventListener("mousemove", this._move);
    this._container.HTML.removeEventListener("touchmove", this._move);
    document.removeEventListener("mouseup", this._end);
    document.removeEventListener("touchend", this._end);
    this.moving = false;

    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();
    let containerRect = this._container.HTML.getBoundingClientRect();
    let position = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    }
    this.makeMouseUp(position);
  }

  public __on__() {
    this.svgElement.addEventListener("mousedown", this._start);
    this.svgElement.addEventListener("touchstart", this._start);
  }
  public __off__() {
    this.svgElement.removeEventListener("mousedown", this._start);
    this.svgElement.removeEventListener("touchstart", this._start);
  }
}
