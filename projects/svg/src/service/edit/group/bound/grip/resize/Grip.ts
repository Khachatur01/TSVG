import {Point} from "../../../../../../model/Point";
import {Container} from "../../../../../../Container";
import {Rect} from "../../../../../../model/Rect";
import {BoxView} from "../../../../../../element/shape/BoxView";
import {Matrix} from "../../../../../math/Matrix";
import {Focus} from "../../../Focus";
import {Cursor} from "../../../../../../dataSource/constant/Cursor";
import {Event} from "../../../../../../dataSource/constant/Event";

export abstract class Grip extends BoxView {
  protected _lastResize: Rect = {x: 0, y: 0, width: 0, height: 0};
  private _start = this.start.bind(this);
  private _move = this.move.bind(this);
  private _end = this.end.bind(this);

  protected side: number = 10;
  protected halfSide: number = 5;
  protected focus: Focus;

  public constructor(container: Container, focus: Focus) {
    super(container, {x: 0, y: 0, width: 10, height: 10});
    this.svgElement.style.cursor = this._container.style.cursor[Cursor.GRIP];
    this.setAttr({
      fill: "white",
      "stroke-width": 0.8,
      stroke: "#002fff"
    });
    this.focus = focus;

    this.svgElement.style.display = "none";
  }

  public makeMouseDown(position: Point, call: boolean = true): void {
    this.focus.__fixRect__();
    this.focus.__fixRefPoint__();
  }
  public makeMouseMove(position: Point, call: boolean = true): void {

  }
  public makeMouseUp(position: Point, call: boolean = true): void {
    this.makeMouseMove(position, false);
    this.focus.__fixRect__();
    if (call) {
      this._container.__call__(Event.ELEMENTS_RESIZED, {elements: this.focus.children, rect: this._lastResize});
    }
  }

  public override __highlight__() {
    this.setAttr({
      stroke: "#00ff00"
    });
  }
  public override __lowlight__() {
    this.setAttr({
      stroke: "#002fff"
    });
  }

  public __show__() {
    this.svgElement.style.display = "block";
  }
  public __hide__() {
    this.svgElement.style.display = "none";
  }

  public abstract __setPosition__(points: Point[]): void;

  private start(event: MouseEvent | TouchEvent) {
    this._container.activeTool?.off();
    this._container.HTML.addEventListener("mousemove", this._move);
    this._container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);

    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    let client: Point = Matrix.rotate(
      [{x: eventPosition.x - containerRect.x, y: eventPosition.y - containerRect.y}],
      this.focus.__refPoint__,
      this.focus.angle
    )[0];

    this.makeMouseDown(client);
  }
  private move(event: MouseEvent | TouchEvent) {
    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    let client: Point = Matrix.rotate(
      [{x: eventPosition.x - containerRect.x, y: eventPosition.y - containerRect.y}],
      this.focus.__refPoint__,
      this.focus.angle
    )[0];

    this.makeMouseMove(client);
  }
  private end(event: MouseEvent | TouchEvent) {
    this._container.activeTool?.on();
    this._container.HTML.removeEventListener("mousemove", this._move);
    this._container.HTML.removeEventListener("touchmove", this._move);
    document.removeEventListener("mouseup", this._end);
    document.removeEventListener("touchend", this._end);

    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    let client: Point = Matrix.rotate(
      [{x: eventPosition.x - containerRect.x, y: eventPosition.y - containerRect.y}],
      this.focus.__refPoint__,
      this.focus.angle
    )[0];

    this.makeMouseUp(client);
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
