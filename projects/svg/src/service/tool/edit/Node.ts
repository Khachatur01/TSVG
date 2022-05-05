import {EllipseView} from "../../../element/shape/circluar/EllipseView";
import {Point} from "../../../model/Point";
import {EditTool} from "./EditTool";
import {Rect} from "../../../model/Rect";
import {Matrix} from "../../math/Matrix";
import {Container} from "../../../Container";
import {Event} from "../../../dataSource/constant/Event";
import {Cursor} from "../../../dataSource/constant/Cursor";

export class Node extends EllipseView {
  private readonly editTool: EditTool;
  private readonly order: number;

  private _start = this.onStart.bind(this);
  private _move = this.onMove.bind(this);
  private _end = this.onEnd.bind(this);

  public constructor(container: Container, editTool: EditTool, position: Point, order: number) {
    super(container, {x: position.x - 8, y: position.y - 8, width: 16, height: 16});
    this.removeOverEvent();
    this.style.fillColor = "white";
    this.style.strokeColor = "black";
    this.style.strokeWidth = "1";
    this.svgElement.style.cursor = this._container.style.cursor[Cursor.NODE];
    this.editTool = editTool;
    this.order = order;
  }

  public override __drag__(delta: Point) {
    super.__drag__({x: delta.x - 8, y: delta.y - 8});
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    if (call) {
      this._container.__call__(Event.NODE_EDIT_MOUSE_DOWN, {order: this.order, position: position, element: this.editTool.editableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    if (!this.editTool.editableElement) return;
    let rotatedPosition = Matrix.rotate(
      [position],
      this.editTool.editableElement.refPoint,
      this.editTool.editableElement.angle
    )[0];

    this.editTool.editableElement.replacePoint(this.order, rotatedPosition);
    this.__drag__(rotatedPosition);

    if (call) {
      this._container.__call__(Event.NODE_EDIT_MOUSE_MOVE, {order: this.order, position: position, element: this.editTool.editableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    this.makeMouseMove(position, false);
    if (!this.editTool.editableElement) return;
    let rotatedPosition = Matrix.rotate(
      [position],
      this.editTool.editableElement.refPoint,
      this.editTool.editableElement.angle
    )[0];

    if (call) {
      this._container.__call__(Event.NODE_EDIT_MOUSE_UP, {order: this.order, position: position, element: this.editTool.editableElement});
      this._container.__call__(Event.NODE_EDITED, {order: this.order, position: rotatedPosition, element: this.editTool.editableElement});
    }
  }

  protected onStart(event: MouseEvent | TouchEvent): void {
    this.editTool.container.HTML.addEventListener("mousemove", this._move);
    this.editTool.container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);

    let containerRect: Rect = this.editTool.container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    let position = this._container.grid.getSnapPoint({
      x: eventPosition.x - containerRect.x,
      y: eventPosition.y - containerRect.y
    });
    this.makeMouseDown(position);
  };
  protected onMove(event: MouseEvent | TouchEvent): void {
    let containerRect: Rect = this.editTool.container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
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
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    let position = this._container.grid.getSnapPoint({
      x: eventPosition.x - containerRect.x,
      y: eventPosition.y - containerRect.y
    });
    this.makeMouseUp(position);
  };

  public __on__() {
    this.svgElement.addEventListener("mousedown", this._start);
    this.svgElement.addEventListener("touchstart", this._start);
  }
  public __off__() {
    this.svgElement.removeEventListener("mousedown", this._start);
    this.svgElement.removeEventListener("touchstart", this._start);
  }
}
