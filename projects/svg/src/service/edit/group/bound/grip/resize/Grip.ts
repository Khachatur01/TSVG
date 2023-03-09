import {BoxView} from '../../../../../../element/shape/BoxView';
import {Rect} from '../../../../../../model/Rect';
import {Point} from '../../../../../../model/Point';
import {Tool} from '../../../../../tool/Tool';
import {Focus} from '../../../Focus';
import {Container} from '../../../../../../Container';
import {Cursor} from '../../../../../../dataSource/constant/Cursor';
import {Matrix} from '../../../../../math/Matrix';
import {SVGEvent} from '../../../../../../dataSource/constant/SVGEvent';

export abstract class Grip extends BoxView {
  protected _lastResize: Rect = {x: 0, y: 0, width: 0, height: 0};
  protected mouseCurrentPos: Point = {x: 0, y: 0};
  private _lastActiveTool: Tool | null = null;

  protected side: number = 10;
  protected halfSide: number = 5;
  protected focus: Focus;

  public constructor(container: Container, focus: Focus) {
    super(container, {overEvent: true}, {x: 0, y: 0, width: 10, height: 10});
    this.svgElement.style.cursor = this._container.style.cursor[Cursor.GRIP];
    this.setAttr({
      fill: 'white',
      'stroke-width': 0.8,
      stroke: '#002fff'
    });
    this.focus = focus;
    this.svgElement.style.display = 'none';

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  private mouseDownEvent(event: MouseEvent | TouchEvent): void {
    this._lastActiveTool = this._container.tools.activeTool;
    this._container.tools.activeTool?.off();
    document.addEventListener('mousemove', this.mouseMoveEvent);
    document.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);

    const position: Point = this.eventToPosition(event);

    this.makeMouseDown(position);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent): void {
    const position: Point = this.eventToPosition(event);

    this.makeMouseMove(position);
  };
  private mouseUpEvent(): void {
    this._lastActiveTool?.on();
    document.removeEventListener('mousemove', this.mouseMoveEvent);
    document.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);

    const client: Point = Matrix.rotate(
      [this.mouseCurrentPos],
      this.focus.__refPoint__,
      this.focus.angle
    )[0];

    this.makeMouseUp(client);
  };

  public makeMouseDown(position: Point, call: boolean = true): void {
    this.focus.__fixRect__();
    this.focus.__fixRefPoint__();
  }
  public makeMouseMove(position: Point, call: boolean = true): void {

  }
  public makeMouseUp(position: Point, call: boolean = true): void {
    this.makeMouseMove(position, false);
    this.focus.__fixRect__();
    if (call) {
      this._container.__call__(SVGEvent.ELEMENTS_RESIZED, {elements: this.focus.children, rect: this._lastResize});
    }
  }

  public override __highlight__(): void {
    this.setAttr({
      stroke: '#00ff00'
    });
  }
  public override __lowlight__(): void {
    this.setAttr({
      stroke: '#002fff'
    });
  }

  private eventToPosition(event: MouseEvent | TouchEvent): Point {
    const containerRect: DOMRect = this._container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this.mouseCurrentPos = {
      x: eventPosition.x - containerRect.x,
      y: eventPosition.y - containerRect.y
    };

    return Matrix.rotate(
      [this.mouseCurrentPos],
      this.focus.__refPoint__,
      this.focus.angle
    )[0];
  }

  public __show__(): void {
    this.svgElement.style.display = 'block';
  }
  public __hide__(): void {
    this.svgElement.style.display = 'none';
  }

  public abstract __setPosition__(points: Point[]): void;

  public __on__(): void {
    this.svgElement.addEventListener('mousedown', this.mouseDownEvent);
    this.svgElement.addEventListener('touchstart', this.mouseDownEvent);
  }
  public __off__(): void {
    this.svgElement.removeEventListener('mousedown', this.mouseDownEvent);
    this.svgElement.removeEventListener('touchstart', this.mouseDownEvent);
  }
}
