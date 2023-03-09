import {PathView} from '../../../../../../element/shape/path/PathView';
import {Point} from '../../../../../../model/Point';
import {Focus} from '../../../Focus';
import {Tool} from '../../../../../tool/Tool';
import {Container} from '../../../../../../Container';
import {Cursor} from '../../../../../../dataSource/constant/Cursor';
import {SVGEvent} from '../../../../../../dataSource/constant/SVGEvent';
import {LineTo} from '../../../../../../model/path/line/LineTo';
import {MoveTo} from '../../../../../../model/path/point/MoveTo';
import {Arc} from '../../../../../../model/path/curve/arc/Arc';

export class RefPoint extends PathView {
  private readonly _r: number = 5; /* radius */
  private _lastCenter: Point = {x: 0, y: 0};
  private _center: Point = {x: 0, y: 0};
  private focus: Focus;
  private mouseCurrentPos: Point = {x: 0, y: 0};
  private _lastActiveTool: Tool | null = null;
  private moving: boolean = false;

  public constructor(container: Container, focus: Focus, x: number = 0, y: number = 0) {
    super(container, {});
    this.style.fillColor = 'transparent';
    this.style.strokeColor = '#002fff';
    this.style.strokeWidth = '0.5';

    this._center = {x, y};
    this.drawPoint(this._center);
    this.focus = focus;

    this.svgElement.style.display = 'none';
    this.svgElement.style.cursor = this._container.style.cursor[Cursor.REFERENCE_POINT];

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  private mouseDownEvent(event: MouseEvent | TouchEvent): void {
    this._lastActiveTool = this._container.tools.activeTool;
    this._container.tools.activeTool?.off();

    this._container.HTML.addEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);
    this.moving = true;

    const containerRect: DOMRect = this._container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this.mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseDown(this.mouseCurrentPos);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent): void {
    const containerRect: DOMRect = this._container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this.mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(this.mouseCurrentPos);
  };
  private mouseUpEvent(): void {
    this._lastActiveTool?.on();
    if (!this.moving) {
      return;
    }

    this._container.HTML.removeEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);
    this.moving = false;

    this.makeMouseUp(this.mouseCurrentPos);
  };

  public makeMouseDown(position: Point, call: boolean = true): void {
    this.focus.__fixRect__();
    this.focus.__fixRefPoint__();
    this._lastRect = Object.assign({}, this._rect);

    position = this._container.grid.getSnapPoint(position);
    this.focus.__refPointView__ = Object.assign({}, position);

    if (call) {
      this._container.__call__(SVGEvent.REF_POINT_VIEW_MOUSE_DOWN, {position, elements: this.focus.children});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true): void {
    position = this._container.grid.getSnapPoint(position);
    this.focus.__refPointView__ = Object.assign({}, position);

    if (call) {
      this._container.__call__(SVGEvent.REF_POINT_VIEW_MOUSE_MOVE, {position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true): void {
    this.makeMouseMove(position);
    const refPoint: Point = this._container.grid.getSnapPoint(position);
    this.focus.__refPoint__ = refPoint;
    this.focus.__correct__(refPoint);
    if (call) {
      this._container.__call__(SVGEvent.REF_POINT_VIEW_MOUSE_UP, {position});
      this._container.__call__(SVGEvent.REF_POINT_CHANGED, {newRefPoint: refPoint, oldRefPoint: this.focus.__lastRefPoint__, elements: this.focus.children});
    }
  }

  public __fixPosition__(): void {
    this._lastCenter = Object.assign({}, this._center);
  }
  public get __lastPosition__(): Point {
    return this._lastCenter;
  }
  public __setPosition__(position: Point): void {
    this._center = position;
    this.drawPoint(position);
  }

  public get r(): number {
    return this._r;
  }

  private drawPoint(point: Point): void {
    const x: number = point.x;
    const y: number = point.y;
    this._path.setAll([
      new MoveTo({x: x - this._r, y}),
      new Arc(this._r, this._r, 0, 0, 1, {x: x + this._r, y}),
      new Arc(this._r, this._r, 0, 0, 1, {x: x - this._r, y}),
      new MoveTo({x: x - this._r - this._r / 2, y}),
      new LineTo({x: x + this._r + this._r / 2, y}),
      new MoveTo({x, y: y - this._r - this._r / 2}),
      new LineTo({x, y: y + this._r + this._r / 2})
    ]);
    this.setAttr({
      d: this._path.toString()
    });
  }

  public __show__(): void {
    this.svgElement.style.display = 'block';
  }
  public __hide__(): void {
    this.svgElement.style.display = 'none';
  }

  public __on__(): void {
    this.svgElement.addEventListener('mousedown', this.mouseDownEvent);
    this.svgElement.addEventListener('touchstart', this.mouseDownEvent);
  }
  public __off__(): void {
    this.svgElement.removeEventListener('mousedown', this.mouseDownEvent);
    this.svgElement.removeEventListener('touchstart', this.mouseDownEvent);
  }
}
