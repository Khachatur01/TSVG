import {EditTableTool} from "./EditTableTool";
import {Container} from "../../../../Container";
import {LineView} from "../../../../element/shape/pointed/LineView";
import {Point} from "../../../../model/Point";
import {Event} from "../../../../dataSource/constant/Event";
import {Matrix} from "../../../math/Matrix";
import {Rect} from "../../../../model/Rect";
import {Table} from "../../../../dataSource/constant/Table";
import {PathView} from "../../../../element/shape/PathView";
import {Path} from "../../../../model/path/Path";
import {MoveTo} from "../../../../model/path/point/MoveTo";
import {LineTo} from "../../../../model/path/line/LineTo";

export class TableGrip {
  private readonly editTool: EditTableTool;
  private readonly type: Table;
  private readonly order: number;
  private readonly _container: Container;
  private readonly lineView: LineView;
  private readonly _grip: PathView;
  private size: number = 0;

  private _start = this.onStart.bind(this);
  private _move = this.onMove.bind(this);
  private _end = this.onEnd.bind(this);

  public constructor(container: Container, editTool: EditTableTool, type: Table, order: number, lineView: LineView) {
    this.editTool = editTool;
    this.type = type;
    this.order = order;
    this._container = container;
    this.lineView = lineView;

    let points = this.lineView.points;
    let lineCenter: Point = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    }
    let path = this.createGripPath(lineCenter, type);
    this._grip = new PathView(this._container,{overEvent: false, globalStyle: false}, path);
    this._grip.style.strokeColor = "#FFFFFF";
    this._grip.style.strokeWidth = "1";
    if (this.editTool.editableElement) {
      this._grip.refPoint = this.editTool.editableElement.refPoint;
      this._grip.__rotate__(this.editTool.editableElement.angle);
    }
  }

  private createGripPath(center: Point, type: Table): Path {
    if (!this.editTool.editableElement) {
      return new Path();
    }
    let MARGIN = 1 + parseInt(this.editTool.editableElement.style.strokeWidth) / 2;
    let TRIANGLE_POINT = 10;
    let path = new Path();
    switch (type) {
      case Table.ROW:
        path.add(new MoveTo({x: center.x - (TRIANGLE_POINT / 2), y: center.y - MARGIN}));
        path.add(new LineTo({x: center.x,                        y: center.y - (TRIANGLE_POINT / 2) - MARGIN}));
        path.add(new LineTo({x: center.x + TRIANGLE_POINT / 2,   y: center.y - MARGIN}, true));

        path.add(new MoveTo({x: center.x - (TRIANGLE_POINT / 2), y: center.y + MARGIN}));
        path.add(new LineTo({x: center.x,                        y: center.y + (TRIANGLE_POINT / 2) + MARGIN}));
        path.add(new LineTo({x: center.x + TRIANGLE_POINT / 2,   y: center.y + MARGIN}, true));
        break;
      case Table.COL:
        path.add(new MoveTo({x: center.x - MARGIN,                        y: center.y - (TRIANGLE_POINT / 2)}));
        path.add(new LineTo({x: center.x - (TRIANGLE_POINT / 2) - MARGIN, y: center.y}));
        path.add(new LineTo({x: center.x - MARGIN,                        y: center.y + (TRIANGLE_POINT / 2)}, true));

        path.add(new MoveTo({x: center.x + MARGIN,                        y: center.y - (TRIANGLE_POINT / 2)}));
        path.add(new LineTo({x: center.x + (TRIANGLE_POINT / 2) + MARGIN, y: center.y}));
        path.add(new LineTo({x: center.x + MARGIN,                        y: center.y + (TRIANGLE_POINT / 2)}, true));
        break;
    }
    return path;
  }

  public __updatePosition__(): void {
    let points = this.lineView.points;
    let lineCenter: Point = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    }

    this._grip.path = this.createGripPath(lineCenter, this.type);
  }

  public get SVG(): SVGElement {
    return this._grip.SVG;
  }

  private getPreviousRow(order: number): LineView | undefined {
    if (order == 0) {
      return this.editTool.editableElement?.topBorder;
    } else {
      return this.editTool.editableElement?.rows[this.order - 1].line;
    }
  }
  private getNextRow(order: number): LineView | undefined {
    return this.editTool.editableElement?.rows[this.order + 1].line;
  }

  private getPreviousCol(order: number): LineView | undefined {
    if (order == 0) {
      return this.editTool.editableElement?.leftBorder;
    } else {
      return this.editTool.editableElement?.cols[this.order - 1].line;
    }
  }
  private getNextCol(order: number): LineView | undefined {
    return this.editTool.editableElement?.cols[this.order + 1].line;
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
        let height: number;
        if (this.order == -1) {
          height = (this.getNextRow(this.order)?.points[0].y || 2) - rotatedPosition.y;
        } else {
          height = rotatedPosition.y - (this.getPreviousRow(this.order)?.points[0].y || 0);
        }
        /* row may be not modified, and modify row method will return real size */
        this.size = this.editTool.editableElement.modifyRow(this.order, height);
        break;
      case Table.COL:
        let width: number;
        if (this.order == -1) {
          width = (this.getNextCol(this.order)?.points[0].x || 2) - rotatedPosition.x;
        } else {
          width = rotatedPosition.x - (this.getPreviousCol(this.order)?.points[0].x || 0);
        }
        /* col may be not modified, and modify col method will return real size */
        this.size = this.editTool.editableElement.modifyCol(this.order, width);
        break;
    }
    if (call) {
      this._container.__call__(Event.TABLE_EDIT_MOUSE_MOVE, {type: this.type, order: this.order, position: position, element: this.editTool.editableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    this.makeMouseMove(position, false);
    if (call) {
      this._container.__call__(Event.TABLE_EDIT_MOUSE_UP, {type: this.type, order: this.order, position: position, element: this.editTool.editableElement});
      this._container.__call__(Event.TABLE_EDITED, {type: this.type, order: this.order, size: this.size, element: this.editTool.editableElement});
    }
  }

  protected onStart(event: MouseEvent | TouchEvent): void {
    this.editTool.container.HTML.addEventListener("mousemove", this._move);
    this.editTool.container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);
    this.lineView.SVG.style.cursor = "grabbing";
    this._grip.SVG.style.cursor = "grabbing";
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

    this.editTool.__topBorderGrip__?.__updatePosition__();
    this.editTool.__leftBorderGrip__?.__updatePosition__();
    this.editTool.__rowGrips__.forEach(rowGrip => {
      rowGrip.__updatePosition__();
    });
    this.editTool.__colGrips__.forEach(colGrip => {
      colGrip.__updatePosition__();
    });
  };
  protected onEnd(event: MouseEvent | TouchEvent): void {
    this.editTool.container.HTML.removeEventListener("mousemove", this._move);
    this.editTool.container.HTML.removeEventListener("touchmove", this._move);
    document.removeEventListener("mouseup", this._end);
    document.removeEventListener("touchend", this._end);
    this.lineView.SVG.style.cursor = "grab";
    this._grip.SVG.style.cursor = "grab";
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
    this._grip.SVG.addEventListener("mousedown", this._start);
    this._grip.SVG.addEventListener("touchstart", this._start);
    this.lineView.SVG.addEventListener("mousedown", this._start);
    this.lineView.SVG.addEventListener("touchstart", this._start);
    this._grip.SVG.style.cursor = "grab";
    this.lineView.SVG.style.cursor = "grab";
  }
  public __off__() {
    this._grip.SVG.removeEventListener("mousedown", this._start);
    this._grip.SVG.removeEventListener("touchstart", this._start);
    this.lineView.SVG.removeEventListener("mousedown", this._start);
    this.lineView.SVG.removeEventListener("touchstart", this._start);
    this._grip.SVG.style.cursor = "default";
    this.lineView.SVG.style.cursor = "default";
  }
}
