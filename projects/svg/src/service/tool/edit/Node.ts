import {EllipseView} from "../../../element/shape/EllipseView";
import {Point} from "../../../model/Point";
import {EditTool} from "./EditTool";
import {Rect} from "../../../model/Rect";
import {Matrix} from "../../math/Matrix";
import {TSVG} from "../../../TSVG";
import {Callback} from "../../../dataSource/Callback";

export class Node extends EllipseView {
  private readonly editTool: EditTool;
  private readonly order: number;

  private _start = this.onStart.bind(this);
  private _move = this.onMove.bind(this);
  private _end = this.onEnd.bind(this);

  public constructor(container: TSVG, editTool: EditTool, position: Point, order: number) {
    super(container, {x: position.x - 8, y: position.y - 8}, 8, 8);
    this.removeOverEvent();
    this.style.fillColor = "white";
    this.style.strokeColor = "black";
    this.style.strokeWidth = "1";
    this.svgElement.style.cursor = "move";
    this.editTool = editTool;
    this.order = order;
    if (this.container.mouseEventSwitches.nodeEdit) {
      this.svgElement.addEventListener("mousedown", this._start);
      this.svgElement.addEventListener("touchstart", this._start);
    }
  }

  public makeMouseDown(position: Point) {}
  public makeMouseMove(position: Point) {
    if (!this.editTool.editableElement) return;
    position = Matrix.rotate(
      [position],
      this.editTool.editableElement.refPoint,
      this.editTool.editableElement.angle
    )[0];

    this.editTool.editableElement.replacePoint(this.order, position);
    this.position = position;
    this._container.call(Callback.NODE_EDIT, {order: this.order, position: position});
  }
  public makeMouseUp(position: Point) {}

  protected onStart(): void {
    this.editTool.container.HTML.addEventListener("mousemove", this._move);
    this.editTool.container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);
    this._container.call(Callback.NODE_EDIT_START, {order: this.order});
  };
  protected onMove(event: MouseEvent | TouchEvent): void {
    let containerRect: Rect = this.editTool.container.HTML.getBoundingClientRect();
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let position = this._container.grid.getSnapPoint({
      x: eventPosition.x - containerRect.x,
      y: eventPosition.y - containerRect.y
    });

    this.makeMouseMove(position);
  };
  protected onEnd(): void {
    this.editTool.container.HTML.removeEventListener("mousemove", this._move);
    this.editTool.container.HTML.removeEventListener("touchmove", this._move);
    document.removeEventListener("mouseup", this._end);
    document.removeEventListener("touchend", this._end);
    this._container.call(Callback.NODE_EDIT_END, {order: this.order});
  };
}
