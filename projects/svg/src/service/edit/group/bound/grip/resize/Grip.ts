import {Point} from "../../../../../../model/Point";
import {TSVG} from "../../../../../../TSVG";
import {Rect} from "../../../../../../model/Rect";
import {BoxView} from "../../../../../../element/shape/BoxView";
import {Matrix} from "../../../../../math/Matrix";
import {Callback} from "../../../../../../dataSource/Callback";

export abstract class Grip extends BoxView {
  protected _lastResize: Rect = {x: 0, y: 0, width: 0, height: 0};
  private _start = this.start.bind(this);
  private _move = this.move.bind(this);
  private _end = this.end.bind(this);

  protected side: number = 10;
  protected halfSide: number = 5;

  public constructor(container: TSVG) {
    super(container, {x: 0, y: 0}, {width: 10, height: 10});
    this.svgElement.style.cursor = "crosshair";
    this.setAttr({
      fill: "white",
      "stroke-width": 0.8,
      stroke: "#002fff"
    });

    this.svgElement.style.display = "none";
    this.on();
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

  protected abstract onStart(client: Point): void;
  protected abstract onMove(client: Point): void;
  protected abstract onEnd(): void;

  private start(event: MouseEvent | TouchEvent) {
    this._container.HTML.addEventListener("mousemove", this._move);
    this._container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);

    this._container.activeTool.off();
    this._container.focused.fixRect();
    this._container.focused.fixRefPoint();

    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let client: Point = Matrix.rotate(
      [{x: eventPosition.x - containerRect.x, y: eventPosition.y - containerRect.y}],
      this._container.focused.refPoint,
      this._container.focused.angle
    )[0];
    this.onStart(client);

    this._container.call(Callback.RESIZE_START);
  }
  private move(event: MouseEvent | TouchEvent) {
    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let client: Point = Matrix.rotate(
      [{x: eventPosition.x - containerRect.x, y: eventPosition.y - containerRect.y}],
      this._container.focused.refPoint,
      this._container.focused.angle
    )[0];

    this.onMove(client);
  }
  private end() {
    this._container.HTML.removeEventListener("mousemove", this._move);
    this._container.HTML.removeEventListener("touchmove", this._move);
    document.removeEventListener("mouseup", this._end);
    document.removeEventListener("touchend", this._end);

    this._container.activeTool.on();
    this._container.focused.fixRect();
    this.onEnd();

    this._container.call(Callback.RESIZE_END);
  }

  public on() {
    if (this._container.mouseEventSwitches.resize) {
      this.svgElement.addEventListener("mousedown", this._start);
      this.svgElement.addEventListener("touchstart", this._start);
    }
  }
  public off() {
    this.svgElement.removeEventListener("mousedown", this._start);
    this.svgElement.removeEventListener("touchstart", this._start);
  }
}
