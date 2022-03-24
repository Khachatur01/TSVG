import {EllipseView} from "../../../element/shape/EllipseView";
import {Point} from "../../../model/Point";
import {EditTool} from "./EditTool";
import {Rect} from "../../../model/Rect";
import {Matrix} from "../../math/Matrix";
import {TSVG} from "../../../TSVG";
import {Callback} from "../../../dataSource/constant/Callback";

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
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    if (call) {
      this._container.call(Callback.NODE_EDIT_START, {order: this.order, position: position, element: this.editTool.pointedEditableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    if (!this.editTool.pointedEditableElement) return;
    let rotatedPosition = Matrix.rotate(
      [position],
      this.editTool.pointedEditableElement.refPoint,
      this.editTool.pointedEditableElement.angle
    )[0];

    this.editTool.pointedEditableElement.replacePoint(this.order, rotatedPosition);
    this.position = rotatedPosition;

    if (call) {
      this._container.call(Callback.NODE_EDIT, {order: this.order, position: position, element: this.editTool.pointedEditableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    this.makeMouseMove(position, false);
    if (call) {
      this._container.call(Callback.NODE_EDIT_END, {order: this.order, position: position, element: this.editTool.pointedEditableElement});
    }
  }

  protected onStart(event: MouseEvent | TouchEvent): void {
    this.editTool.container.HTML.addEventListener("mousemove", this._move);
    this.editTool.container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);

    let containerRect: Rect = this.editTool.container.HTML.getBoundingClientRect();
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let position = this._container.grid.getSnapPoint({
      x: eventPosition.x - containerRect.x,
      y: eventPosition.y - containerRect.y
    });
    this.makeMouseDown(position);
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
  protected onEnd(event: MouseEvent | TouchEvent): void {
    this.editTool.container.HTML.removeEventListener("mousemove", this._move);
    this.editTool.container.HTML.removeEventListener("touchmove", this._move);
    document.removeEventListener("mouseup", this._end);
    document.removeEventListener("touchend", this._end);

    let containerRect: Rect = this.editTool.container.HTML.getBoundingClientRect();
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let position = this._container.grid.getSnapPoint({
      x: eventPosition.x - containerRect.x,
      y: eventPosition.y - containerRect.y
    });
    this.makeMouseUp(position);
  };

  public on() {
    this.svgElement.addEventListener("mousedown", this._start);
    this.svgElement.addEventListener("touchstart", this._start);
  }
}
