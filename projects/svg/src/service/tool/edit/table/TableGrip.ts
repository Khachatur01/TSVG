import {EditTableTool} from './EditTableTool';
import {Container} from '../../../../Container';
import {LineView} from '../../../../element/shape/pointed/LineView';
import {Point} from '../../../../model/Point';
import {SVGEvent} from '../../../../dataSource/constant/SVGEvent';
import {Matrix} from '../../../math/Matrix';
import {Table} from '../../../../dataSource/constant/Table';
import {PathView} from '../../../../element/shape/path/PathView';
import {Path} from '../../../../model/path/Path';
import {MoveTo} from '../../../../model/path/point/MoveTo';
import {LineTo} from '../../../../model/path/line/LineTo';

export class TableGrip {
  private readonly editTool: EditTableTool;
  private readonly type: Table;
  private readonly order: number;
  private readonly _container: Container;
  private readonly lineView: LineView;
  private readonly _grip: PathView;
  private size: number = 0;

  protected mouseCurrentPos: Point = {x: 0, y: 0};

  public constructor(container: Container, editTool: EditTableTool, type: Table, order: number, lineView: LineView) {
    this.editTool = editTool;
    this.type = type;
    this.order = order;
    this._container = container;
    this.lineView = lineView;

    const points: Point[] = this.lineView.points;
    const lineCenter: Point = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    };
    const path: Path = this.createGripPath(lineCenter, type);
    this._grip = new PathView(this._container,{overEvent: false, globalStyle: false}, path);
    this._grip.style.strokeColor = '#FFFFFF';
    this._grip.style.strokeWidth = '1';
    if (this.editTool.editableElement) {
      this._grip.refPoint = this.editTool.editableElement.refPoint;
      this._grip.__rotate__(this.editTool.editableElement.angle);
    }

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  private mouseDownEvent(event: MouseEvent | TouchEvent): void {
    this.editTool.container.HTML.addEventListener('mousemove', this.mouseMoveEvent);
    this.editTool.container.HTML.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);
    this.lineView.SVG.style.cursor = 'grabbing';
    this._grip.SVG.style.cursor = 'grabbing';
    this._container.HTML.style.cursor = 'grabbing';

    const containerRect: DOMRect = this.editTool.container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this.mouseCurrentPos = this._container.grid.getSnapPoint({
      x: eventPosition.x - containerRect.x,
      y: eventPosition.y - containerRect.y
    });
    this.makeMouseDown(this.mouseCurrentPos);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent): void {
    const containerRect: DOMRect = this.editTool.container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this.mouseCurrentPos = this._container.grid.getSnapPoint({
      x: eventPosition.x - containerRect.x,
      y: eventPosition.y - containerRect.y
    });

    this.makeMouseMove(this.mouseCurrentPos);

    this.editTool.__topBorderGrip__?.__updatePosition__();
    this.editTool.__leftBorderGrip__?.__updatePosition__();
    this.editTool.__rowGrips__.forEach((rowGrip: TableGrip) => {
      rowGrip.__updatePosition__();
    });
    this.editTool.__colGrips__.forEach((colGrip: TableGrip) => {
      colGrip.__updatePosition__();
    });
  };
  private mouseUpEvent(): void {
    this.editTool.container.HTML.removeEventListener('mousemove', this.mouseMoveEvent);
    this.editTool.container.HTML.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);
    this.lineView.SVG.style.cursor = 'grab';
    this._grip.SVG.style.cursor = 'grab';
    this._container.HTML.style.cursor = 'default';

    this.makeMouseUp(this.mouseCurrentPos);
  };

  private createGripPath(center: Point, type: Table): Path {
    if (!this.editTool.editableElement) {
      return new Path();
    }
    const MARGIN: number = 1 + parseInt(this.editTool.editableElement.style.strokeWidth) / 2;
    const TRIANGLE_POINT: number = 10;
    const path: Path = new Path();
    switch (type) {
      case Table.ROW:
        path.add(new MoveTo({x: center.x - (TRIANGLE_POINT / 2),            y: center.y - MARGIN}));
        path.add(new LineTo({x: center.x,                                   y: center.y - (TRIANGLE_POINT / 2) - MARGIN}));
        path.add(new LineTo({x: center.x + TRIANGLE_POINT / 2,              y: center.y - MARGIN}, true));

        path.add(new MoveTo({x: center.x - (TRIANGLE_POINT / 2),            y: center.y + MARGIN}));
        path.add(new LineTo({x: center.x,                                   y: center.y + (TRIANGLE_POINT / 2) + MARGIN}));
        path.add(new LineTo({x: center.x + TRIANGLE_POINT / 2,              y: center.y + MARGIN}, true));
        break;
      case Table.COL:
        path.add(new MoveTo({x: center.x - MARGIN,                          y: center.y - (TRIANGLE_POINT / 2)}));
        path.add(new LineTo({x: center.x - (TRIANGLE_POINT / 2) - MARGIN,   y: center.y}));
        path.add(new LineTo({x: center.x - MARGIN,                          y: center.y + (TRIANGLE_POINT / 2)}, true));

        path.add(new MoveTo({x: center.x + MARGIN,                          y: center.y - (TRIANGLE_POINT / 2)}));
        path.add(new LineTo({x: center.x + (TRIANGLE_POINT / 2) + MARGIN,   y: center.y}));
        path.add(new LineTo({x: center.x + MARGIN,                          y: center.y + (TRIANGLE_POINT / 2)}, true));
        break;
    }
    return path;
  }

  public __updatePosition__(): void {
    const points: Point[] = this.lineView.points;
    const lineCenter: Point = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    };

    this._grip.path = this.createGripPath(lineCenter, this.type);
  }

  public get SVG(): SVGElement {
    return this._grip.SVG;
  }

  private getPreviousRow(): LineView | undefined {
    if (this.order === 0) {
      return this.editTool.editableElement?.topBorder;
    } else {
      return this.editTool.editableElement?.rows[this.order - 1].line;
    }
  }
  private getNextRow(): LineView | undefined {
    return this.editTool.editableElement?.rows[this.order + 1].line;
  }

  private getPreviousCol(): LineView | undefined {
    if (this.order === 0) {
      return this.editTool.editableElement?.leftBorder;
    } else {
      return this.editTool.editableElement?.cols[this.order - 1].line;
    }
  }
  private getNextCol(): LineView | undefined {
    return this.editTool.editableElement?.cols[this.order + 1].line;
  }

  public makeMouseDown(position: Point, call: boolean = true): void {
    if (call) {
      this._container.__call__(SVGEvent.TABLE_EDIT_MOUSE_DOWN, {type: this.type, order: this.order, position, element: this.editTool.editableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true): void {
    if (!this.editTool.editableElement) {return;}
    const rotatedPosition: Point = Matrix.rotate(
      [position],
      this.editTool.editableElement.refPoint,
      this.editTool.editableElement.angle
    )[0];

    switch (this.type) {
      case Table.ROW:
        let height: number;
        if (this.order === -1) {
          height = (this.getNextRow()?.points[0].y || 2) - rotatedPosition.y;
        } else {
          height = rotatedPosition.y - (this.getPreviousRow()?.points[0].y || 0);
        }
        /* row may be not modified, and modify row method will return real size */
        this.size = this.editTool.editableElement.modifyRow(this.order, height);
        break;
      case Table.COL:
        let width: number;
        if (this.order === -1) {
          width = (this.getNextCol()?.points[0].x || 2) - rotatedPosition.x;
        } else {
          width = rotatedPosition.x - (this.getPreviousCol()?.points[0].x || 0);
        }
        /* col may be not modified, and modify col method will return real size */
        this.size = this.editTool.editableElement.modifyCol(this.order, width);
        break;
    }
    if (call) {
      this._container.__call__(SVGEvent.TABLE_EDIT_MOUSE_MOVE, {type: this.type, order: this.order, position, element: this.editTool.editableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true): void {
    this.makeMouseMove(position, false);
    if (call) {
      this._container.__call__(SVGEvent.TABLE_EDIT_MOUSE_UP, {type: this.type, order: this.order, position, element: this.editTool.editableElement});
      this._container.__call__(SVGEvent.TABLE_EDITED, {type: this.type, order: this.order, size: this.size, element: this.editTool.editableElement});
    }
  }

  public __on__(): void {
    this._grip.SVG.addEventListener('mousedown', this.mouseDownEvent);
    this._grip.SVG.addEventListener('touchstart', this.mouseDownEvent);
    this.lineView.SVG.addEventListener('mousedown', this.mouseDownEvent);
    this.lineView.SVG.addEventListener('touchstart', this.mouseDownEvent);
    this._grip.SVG.style.cursor = 'grab';
    this.lineView.SVG.style.cursor = 'grab';
  }
  public __off__(): void {
    this._grip.SVG.removeEventListener('mousedown', this.mouseDownEvent);
    this._grip.SVG.removeEventListener('touchstart', this.mouseDownEvent);
    this.lineView.SVG.removeEventListener('mousedown', this.mouseDownEvent);
    this.lineView.SVG.removeEventListener('touchstart', this.mouseDownEvent);
    this._grip.SVG.style.cursor = 'default';
    this.lineView.SVG.style.cursor = 'default';
  }
}
