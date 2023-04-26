import {Tool} from '../Tool';
import {Cursor} from '../../../dataSource/constant/Cursor';
import {Focus} from '../../edit/group/Focus';
import {Point} from '../../../model/Point';
import {ElementView} from '../../../element/ElementView';
import {Container} from '../../../Container';
import {SVGEvent} from '../../../dataSource/constant/SVGEvent';
import {Size} from '../../../model/Size';
import {Rect} from '../../../model/Rect';

export class EraserTool extends Tool {
  protected override _cursor: Cursor = Cursor.ERASER;
  public focus: Focus;
  public eraserSize: Size = {width: 10, height: 10};
  private elementsClickEvents: {element: ElementView; callback: () => void}[] = [];

  public constructor(container: Container, focus: Focus) {
    super(container);
    this.focus = focus;

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);

    this.clickEvent = this.clickEvent.bind(this);

    this._container.addCallBack(SVGEvent.ELEMENT_ADDED, ({element}: any) => {
      /* if select tool is on, add click event to newly added element */
      if (this._isOn) {
        const clickEvent = this.clickEvent.bind(this, element);
        element.SVG.addEventListener('mousedown', clickEvent);
        element.SVG.addEventListener('touchstart', clickEvent);
        this.elementsClickEvents.push({element, callback: clickEvent});
      }
    });
  }

  private clickEvent(element: ElementView): void {
    if (element.group) {
      element = element.group;
    }
    if (element.erasable && element.selectable) {
      this._container.remove(element, true);
    }
  }
  private mouseDownEvent(event: MouseEvent | TouchEvent): void {
    this._container.HTML.addEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent): void {
    const containerRect: DOMRect = this._container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    const mousePosition: Point = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    const elements: Set<ElementView> = new Set<ElementView>(this._container.elements);
    elements.forEach((element: ElementView) => {
      const eraserRect: Rect = {
        x: mousePosition.x - this.eraserSize.width / 2,
        y: mousePosition.y - this.eraserSize.height / 2,
        width: this.eraserSize.width,
        height: this.eraserSize.height
      };
      if (element.erasable && element.selectable && element.intersectsRect(eraserRect)) {
        this._container.remove(element, true);
      }
    });
  };
  private mouseUpEvent(event: MouseEvent | TouchEvent): void {
    this._container.HTML.removeEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);
  };

  public makeMouseDown(position: Point, call: boolean = true): void {}
  public makeMouseMove(position: Point, call: boolean = true): void {}
  public makeMouseUp(position: Point, call: boolean = true): void {}

  public override on(call: boolean = true): boolean {
    if (!super.on(call)) {
      return false;
    }

    this._container.HTML.addEventListener('mousedown', this.mouseDownEvent);
    this._container.HTML.addEventListener('touchstart', this.mouseDownEvent);
    this._container.elementsDeep.forEach((element: ElementView) => {
      const callback = this.clickEvent.bind(this, element);
      element.SVG.addEventListener('mousedown', callback);
      element.SVG.addEventListener('touchstart', callback);
      this.elementsClickEvents.push({element, callback});
    });

    this._container.style.changeCursor(this.cursor);
    if (call) {
      this._container.__call__(SVGEvent.ERASER_TOOl_ON);
    }
    return true;
  }
  public override off(call: boolean = true): boolean {
    if (!super.off(call)) {
      return false;
    }

    this._container.HTML.removeEventListener('mousedown', this.mouseDownEvent);
    this._container.HTML.removeEventListener('touchstart', this.mouseDownEvent);
    this.elementsClickEvents.forEach((elementCallback: {element: ElementView; callback: () => void}) => {
      elementCallback.element.SVG.removeEventListener('mousedown', elementCallback.callback);
      elementCallback.element.SVG.removeEventListener('touchstart', elementCallback.callback);
    });

    if (call) {
      this._container.__call__(SVGEvent.ERASER_TOOl_OFF);
    }
    return true;
  }
}
