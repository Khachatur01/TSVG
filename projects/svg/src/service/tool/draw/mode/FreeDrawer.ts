import {FreeView} from '../../../../element/shape/path/FreeView';
import {Container} from '../../../../Container';
import {Point} from '../../../../model/Point';
import {Angle} from '../../../math/Angle';
import {Path} from '../../../../model/path/Path';
import {MoveTo} from '../../../../model/path/point/MoveTo';
import {SVGEvent} from '../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../dataSource/constant/ElementType';
import {ElementView} from '../../../../element/ElementView';
import {Cursor} from '../../../../dataSource/constant/Cursor';
import {DrawTool} from '../DrawTool';
import {Drawer} from '../Drawer';
import {LineTo} from '../../../../model/path/line/LineTo';
import {SQBezier} from '../../../../model/path/curve/bezier/quadratic/SQBezier';
import {QBezier} from '../../../../model/path/curve/bezier/quadratic/QBezier';

export class FreeDrawer extends Drawer {
  private _drawableElement: FreeView | undefined = undefined;
  private points: Point[] = [];
  public snappable: boolean = false;

  public constructor(drawTool: DrawTool) {
    super(drawTool);
    this.cursor = Cursor.DRAW_FREE;

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  public makeMouseDown(position: Point, call: boolean = true, parameter?: any): void {
    if (this.drawTool.isDrawing) {
      return;
    }
    if (this.snappable) {
      position = this.drawTool.container.grid.getSnapPoint(position);
    }
    this.points = [];

    const pathObject: Path = new Path();
    pathObject.add(new MoveTo(position));
    this._drawableElement = new FreeView(this.drawTool.container, {overEvent: true, globalStyle: true}, pathObject);
    this.drawTool.__drawing__();

    this.drawTool.container.add(this._drawableElement);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.DRAW_MOUSE_DOWN, {position, element: this._drawableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true, parameter?: any): void {
    if (!this._drawableElement) {
      return;
    }

    if (parameter) {
      this._drawableElement.setAttr({
        d: parameter.path
      });
    } else {
      if (this.snappable && this.drawTool.container.grid.isSnapOn()) {
        position = this.drawTool.container.grid.getSnapPoint(position);
        this._drawableElement.pushPoint(position);
      } else if (this.drawTool.perfect) {
        try {
          const lastPoint: Point = this._drawableElement.getPoint(-1);
          position = Angle.snapLineEnd(lastPoint, position) as Point;
          this._drawableElement.replacePoint(-1, position);
        } catch (typeError) {
          /* lastPoint may be undefined */
        }
      } else {
        this.points.push(position);
        this._drawableElement.pushPoint(position);
        if (this.drawTool.smooth.isOn && this.drawTool.smooth.realTime) {
          if (this.points.length > 1) {
            this._drawableElement.path = this.smoothQuadratic(this.points, this.drawTool.smooth.coefficient);
          }
        }
      }
    }

    if (call) {
      this.drawTool.container.__call__(SVGEvent.DRAW_MOUSE_MOVE, {position, element: this._drawableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true, parameter?: any): void {
    if (!this._drawableElement) {
      return;
    }

    if (parameter) {
      this._drawableElement.pathString = parameter.path;
    }
    if (!this._drawableElement.isComplete()) {
      this.drawTool.container.remove(this._drawableElement, true, false);
    } else {
      this._drawableElement.refPoint = this._drawableElement.center;
    }
    this.drawTool.__drawingEnd__();

    if (this.drawTool.smooth.isOn && !this.drawTool.smooth.realTime) {
      const points: Point[] = this._drawableElement.points;
      this._drawableElement.path = this.smoothQuadratic(points, this.drawTool.smooth.coefficient);
    }

    if (call) {
      this.drawTool.container.__call__(SVGEvent.DRAW_MOUSE_UP, {position, element: this._drawableElement});
      this.drawTool.container.__call__(SVGEvent.ELEMENT_CREATED, {position, element: this._drawableElement});
      this.drawTool.container.__call__(SVGEvent.END_DRAWING, {drawer: this});
    }
  }

  /* mouseDownEvent method defined in parent class */
  protected mouseMoveEvent(event: MouseEvent | TouchEvent): void {
    const containerRect: DOMRect = this.drawTool.container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this.drawTool.__mouseCurrentPos__ = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(this.drawTool.mouseCurrentPos);
  }
  protected mouseUpEvent(event: MouseEvent | TouchEvent): void {
    this.stopDrawing();
  }

  private smoothQuadratic(points: Point[], skip: number = 0): Path {
    const path: Path = new Path();
    const even: boolean = points.length - skip - (1 % 2) === 0;

    /* set starting point */
    path.add(new MoveTo(points[0]));

    /* split 1st line segment */
    let middlePoint: Point = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2
    };
    path.add(new LineTo(middlePoint));

    for (let i = 1; i < points.length; i += 1 + skip) {
      const nextPoint: Point = points[i + 1 + skip] ?
        points[i + 1 + skip] :
        points[points.length - 1];

      middlePoint = {
        x: (points[i].x + nextPoint.x) / 2,
        y: (points[i].y + nextPoint.y) / 2
      };

      if (i > 1) {
        path.add(new SQBezier(middlePoint));
      } else {
        path.add(new QBezier(points[i], middlePoint));
      }
    }

    /* add last line if odd number of segments */
    if (!even) {
      path.add(new LineTo({
        x: points[points.length - 1].x,
        y: points[points.length - 1].y
      }));
    }
    return path;
  }

  public override _new(): FreeDrawer {
    return new FreeDrawer(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.FREE;
  }
  public get drawableElement(): ElementView | undefined {
    return this._drawableElement;
  }

  public override stopDrawing(call?: boolean): void {
    document.removeEventListener('mousemove', this.mouseMoveEvent);
    document.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);

    if (this.drawTool.isDrawing) {
      this.makeMouseUp(this.drawTool.mouseCurrentPos, call);
    }
    this.drawTool.container.tools.drawTool.__drawingEnd__();
  }

  public start(call: boolean = true): void {
    this.drawTool.container.HTML.addEventListener('mousedown', this.mouseDownEvent);
    this.drawTool.container.HTML.addEventListener('touchstart', this.mouseDownEvent);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.FREE_HAND_TOOL_ON);
    }
  }
  public stop(call: boolean = true): void {
    this.drawTool.container.HTML.removeEventListener('mousedown', this.mouseDownEvent);
    this.drawTool.container.HTML.removeEventListener('touchstart', this.mouseDownEvent);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.FREE_HAND_TOOL_OFF);
    }
  }
}
