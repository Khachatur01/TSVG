import {EditTableTool} from "./EditTableTool";
import {Container} from "../../../../Container";
import {LineView} from "../../../../element/shape/pointed/LineView";
import {Point} from "../../../../model/Point";
import {Event} from "../../../../dataSource/constant/Event";
import {Matrix} from "../../../math/Matrix";
import {Rect} from "../../../../model/Rect";
import {Table} from "../../../../dataSource/constant/Table";

export class TableGrip {
  private readonly editTool: EditTableTool;
  private readonly type: Table;
  private readonly order: number;
  private readonly _container: Container;
  private lineView: LineView;

  private _start = this.onStart.bind(this);
  private _move = this.onMove.bind(this);
  private _end = this.onEnd.bind(this);

  public constructor(container: Container, editTool: EditTableTool, type: Table, order: number, lineView: LineView) {
    this.editTool = editTool;
    this.type = type;
    this.order = order;
    this._container = container;
    this.lineView = lineView;
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    if (call) {
      this._container.__call__(Event.TABLE_EDIT_MOUSE_DOWN, {type: this.type, order: this.order, position: position, element: this.editTool.editableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    if (!this.editTool.editableElement) return;
    let rotatedPosition = Matrix.rotate(
      [position],
      this.editTool.editableElement.refPoint,
      this.editTool.editableElement.angle
    )[0];

    switch (this.type) {
      case Table.ROW:
        let previousLineY: number = this.editTool.editableElement.getRowsHeight(0, this.order - 1);
        this.editTool.editableElement.modifyRow(this.order, rotatedPosition.y - (previousLineY + this.editTool.editableElement.getRect().y));
        break;
      case Table.COL:
        let previousLineX: number = this.editTool.editableElement.getColsWidth(0, this.order - 1);
        this.editTool.editableElement.modifyCol(this.order, rotatedPosition.x - (previousLineX + this.editTool.editableElement.getRect().x));
        break;
    }

    if (call) {
      this._container.__call__(Event.TABLE_EDIT_MOUSE_MOVE, {type: this.type, order: this.order, position: position, element: this.editTool.editableElement});
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
      this._container.__call__(Event.TABLE_EDIT_MOUSE_UP, {type: this.type, order: this.order, position: position, element: this.editTool.editableElement});
      this._container.__call__(Event.TABLE_EDITED, {type: this.type, order: this.order, position: rotatedPosition, element: this.editTool.editableElement});
    }
  }

  protected onStart(event: MouseEvent | TouchEvent): void {
    this.editTool.container.HTML.addEventListener("mousemove", this._move);
    this.editTool.container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);
    this.lineView.SVG.style.cursor = "grabbing";
    this._container.HTML.style.cursor = "grabbing";

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
    this.lineView.SVG.style.cursor = "grab";
    this._container.HTML.style.cursor = "default";

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
    this.lineView.SVG.addEventListener("mousedown", this._start);
    this.lineView.SVG.addEventListener("touchstart", this._start);
    this.lineView.SVG.style.cursor = "grab";
    this._container.HTML.style.cursor = "grab";
  }
  public __off__() {
    this.lineView.SVG.removeEventListener("mousedown", this._start);
    this.lineView.SVG.removeEventListener("touchstart", this._start);
    this.lineView.SVG.style.cursor = "default";
    this._container.HTML.style.cursor = "default";
  }
}
