import {EllipseView} from "../../../../element/shape/circluar/EllipseView";
import {Point} from "../../../../model/Point";
import {EditNodeTool} from "./EditNodeTool";
import {Rect} from "../../../../model/Rect";
import {Matrix} from "../../../math/Matrix";
import {Container} from "../../../../Container";
import {Event} from "../../../../dataSource/constant/Event";
import {Cursor} from "../../../../dataSource/constant/Cursor";

export class Node extends EllipseView {
  private readonly editTool: EditNodeTool;
  private readonly order: number;
  protected mouseCurrentPos: Point = {x: 0, y: 0};

  public constructor(container: Container, editTool: EditNodeTool, position: Point, order: number) {
    super(container, {overEvent: true, globalStyle: false}, {x: position.x - 8, y: position.y - 8, width: 16, height: 16});
    this.style.fillColor = "white";
    this.style.strokeColor = "black";
    this.style.strokeWidth = "1";
    this.svgElement.style.cursor = this._container.style.cursor[Cursor.NODE];
    this.editTool = editTool;
    this.order = order;

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  public override __drag__(delta: Point) {
    super.__drag__({x: delta.x - 8, y: delta.y - 8});
  }

  private mouseDownEvent(event: MouseEvent | TouchEvent) {
    this.editTool.container.HTML.addEventListener("mousemove", this.mouseMoveEvent);
    this.editTool.container.HTML.addEventListener("touchmove", this.mouseMoveEvent);
    document.addEventListener("mouseup", this.mouseUpEvent);
    document.addEventListener("touchend", this.mouseUpEvent);

    let containerRect: Rect = this.editTool.container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);

    this.mouseCurrentPos = this._container.grid.getSnapPoint({
      x: eventPosition.x - containerRect.x,
      y: eventPosition.y - containerRect.y
    });
    this.makeMouseDown(this.mouseCurrentPos);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent) {
    let containerRect: Rect = this.editTool.container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);

    this.mouseCurrentPos = this._container.grid.getSnapPoint({
      x: eventPosition.x - containerRect.x,
      y: eventPosition.y - containerRect.y
    });

    this.makeMouseMove(this.mouseCurrentPos);
  };
  private mouseUpEvent() {
    this.editTool.container.HTML.removeEventListener("mousemove", this.mouseMoveEvent);
    this.editTool.container.HTML.removeEventListener("touchmove", this.mouseMoveEvent);
    document.removeEventListener("mouseup", this.mouseUpEvent);
    document.removeEventListener("touchend", this.mouseUpEvent);

    this.makeMouseUp(this.mouseCurrentPos);
  };

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

  public __on__() {
    this.svgElement.addEventListener("mousedown", this.mouseDownEvent);
    this.svgElement.addEventListener("touchstart", this.mouseDownEvent);
  }
  public __off__() {
    this.svgElement.removeEventListener("mousedown", this.mouseDownEvent);
    this.svgElement.removeEventListener("touchstart", this.mouseDownEvent);
  }
}
