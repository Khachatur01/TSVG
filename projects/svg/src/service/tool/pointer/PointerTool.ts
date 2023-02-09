import {Tool} from '../Tool';
import {Container} from '../../../Container';
import {SVGEvent} from '../../../dataSource/constant/SVGEvent';
import {Point} from '../../../model/Point';
import {Cursor} from '../../../dataSource/constant/Cursor';
import {PathView} from '../../../element/shape/path/PathView';
import {Path} from '../../../model/path/Path';
import {ElementView} from '../../../element/ElementView';

export class PointerTool extends Tool {
  protected override _cursor: Cursor = Cursor.POINTER;
  private _pointerPath: PathView;
  private readonly _pointer: SVGElement;
  private _isVisible = false;

  public constructor(container: Container, path?: Path) {
    super(container);
    this._pointerPath = new PathView(this._container, {}, path);
    this._pointer = document.createElementNS(ElementView.svgURI, 'svg');
    this._pointer.appendChild(this._pointerPath.SVG);

    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
  }

  private mouseMoveEvent(event: TouchEvent | MouseEvent) {
    const containerRect = this._container.HTML.getBoundingClientRect();
    const eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = eventPosition;

    const movePosition = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(movePosition);
  };

  public makeMouseDown(position: Point, call: boolean = true) {}
  public makeMouseMove(position: Point, call: boolean = true) {
    this._pointer.setAttribute('x', position.x + '');
    this._pointer.setAttribute('y', position.y + '');

    if (call) {
      this._container.__call__(SVGEvent.POINTER_MOVE, {position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {}

  public getStrokeWidth(): string {
    return this._pointerPath.style.strokeWidth;
  }
  public setStrokeWidth(width: string, call: boolean = true) {
    this._pointerPath.style.strokeWidth = width;
    if (call) {
      this._container.__call__(SVGEvent.POINTER_STROKE_WIDTH_CHANGE, {strokeWidth: width});
    }
  }
  public getStrokeDasharray(): string {
    return this._pointerPath.style.strokeDashArray;
  }
  public setStrokeDasharray(dashArray: string, call: boolean = true) {
    this._pointerPath.style.strokeDashArray = dashArray;
    if (call) {
      this._container.__call__(SVGEvent.POINTER_STROKE_DASH_ARRAY_CHANGE, {strokeDashArray: dashArray});
    }
  }
  public getStrokeColor(): string {
    return this._pointerPath.style.strokeColor;
  }
  public setStrokeColor(color: string, call: boolean = true) {
    this._pointerPath.style.strokeColor = color;
    if (call) {
      this._container.__call__(SVGEvent.POINTER_STROKE_COLOR_CHANGE, {strokeColor: color});
    }
  }
  public getFillColor(): string {
    return this._pointerPath.style.fillColor;
  }
  public setFillColor(color: string, call: boolean = true) {
    this._pointerPath.style.fillColor = color;
    if (call) {
      this._container.__call__(SVGEvent.POINTER_FILL_COLOR_CHANGE, {fillColor: color});
    }
  }

  public get isVisible(): boolean {
    return this._isVisible;
  }

  public add() {
    this._container.__pointersGroup__.appendChild(this._pointer);
    this._isVisible = true;
  }
  public remove() {
    try {
      this._container.__pointersGroup__.removeChild(this._pointer);
      this._isVisible = false;
    } catch (e) {}
  }

  public getPath(): Path {
    return this._pointerPath.path;
  }
  public setPath(path: Path, call: boolean = true) {
    this._pointerPath = new PathView(this._container, {}, path);

    if (call) {
      this._container.__call__(SVGEvent.POINTER_CHANGE, {pathView: path});
    }
  }

  public override on(call: boolean = true): boolean {
    if (!super.on(call)) {
      return false;
    }
    this.add();
    document.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mousemove', this.mouseMoveEvent);
    this._container.blur();

    this._container.style.changeCursor(this.cursor);
    if (call) {
      this._container.__call__(SVGEvent.POINTER_TOOl_ON);
    }
    return true;
  }
  public override off(call: boolean = true): boolean {
    if (!super.off(call)) {
      return false;
    }
    this.remove();
    document.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mousemove', this.mouseMoveEvent);

    if (call) {
      this._container.__call__(SVGEvent.POINTER_TOOl_OFF);
    }
    return true;
  }
}
