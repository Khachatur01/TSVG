import {Point} from "../../../../../../model/Point";
import {Container} from "../../../../../../Container";
import {Rect} from "../../../../../../model/Rect";
import {BoxView} from "../../../../../../element/shape/BoxView";
import {Matrix} from "../../../../../math/Matrix";
import {Focus} from "../../../Focus";
import {Cursor} from "../../../../../../dataSource/constant/Cursor";
import {Callback} from "../../../../../../dataSource/constant/Callback";

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
    this.focus.fixRect();
    this.focus.fixRefPoint();
  }
  public makeMouseMove(position: Point, call: boolean = true): void {

  }
  public makeMouseUp(position: Point, call: boolean = true): void {
    this.makeMouseMove(position, false);
    this.focus.fixRect();
    if (call) {
      this._container.call(Callback.ELEMENTS_RESIZED, {elements: this.focus.children, rect: this._lastResize});
    }
  }

  public override highlight() {
    this.setAttr({
      stroke: "#00ff00"
    });
  }
  public override lowlight() {
    this.setAttr({
      stroke: "#002fff"
    });
  }

  public show() {
    this.svgElement.style.display = "block";
  }
  public hide() {
    this.svgElement.style.display = "none";
  }

  public abstract setPosition(points: Point[]): void;

  private start(event: MouseEvent | TouchEvent) {
    this._container.HTML.addEventListener("mousemove", this._move);
    this._container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);

    this._container.activeTool.off();

    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = Container.eventToPosition(event);
    event.preventDefault();

    let client: Point = Matrix.rotate(
      [{x: eventPosition.x - containerRect.x, y: eventPosition.y - containerRect.y}],
      this.focus.refPoint,
      this.focus.angle
    )[0];

    this.makeMouseDown(client);
  }
  private move(event: MouseEvent | TouchEvent) {
    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = Container.eventToPosition(event);
    event.preventDefault();

    let client: Point = Matrix.rotate(
      [{x: eventPosition.x - containerRect.x, y: eventPosition.y - containerRect.y}],
      this.focus.refPoint,
      this.focus.angle
    )[0];

    this.makeMouseMove(client);
  }
  private end(event: MouseEvent | TouchEvent) {
    this._container.HTML.removeEventListener("mousemove", this._move);
    this._container.HTML.removeEventListener("touchmove", this._move);
    document.removeEventListener("mouseup", this._end);
    document.removeEventListener("touchend", this._end);

    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = Container.eventToPosition(event);
    event.preventDefault();

    let client: Point = Matrix.rotate(
      [{x: eventPosition.x - containerRect.x, y: eventPosition.y - containerRect.y}],
      this.focus.refPoint,
      this.focus.angle
    )[0];

    this._container.activeTool.on();

    this.makeMouseUp(client);
  }

  public on() {
    this.svgElement.addEventListener("mousedown", this._start);
    this.svgElement.addEventListener("touchstart", this._start);
  }
  public off() {
    this.svgElement.removeEventListener("mousedown", this._start);
    this.svgElement.removeEventListener("touchstart", this._start);
  }
}
