import {Tool} from '../Tool';
import {Container} from '../../../Container';
import {RectangleView} from '../../../element/shape/pointed/polygon/rectangle/RectangleView';
import {Point} from '../../../model/Point';
import {DragTool} from '../drag/DragTool';
import {SVGEvent} from '../../../dataSource/constant/SVGEvent';
import {Focus} from '../../edit/group/Focus';
import {Cursor} from '../../../dataSource/constant/Cursor';
import {ElementView} from '../../../element/ElementView';

export class SelectTool extends Tool {
  protected override _cursor: Cursor = Cursor.SELECT;
  private readonly boundingBox: RectangleView;
  private position: Point = {x: 0, y: 0};
  public readonly dragTool: DragTool;
  public focus: Focus;
  public intersectionColor: string = 'green';
  public fullMatchColor: string = '#1545ff';
  private elementsClickEvents: {element: ElementView; callback: () => void}[] = [];

  private elementsOverEvent: {element: ElementView; overEvent: boolean}[] = [];

  public constructor(container: Container, focus: Focus) {
    super(container);
    this.boundingBox = new RectangleView(container);
    this.dragTool = new DragTool(container, focus);
    this.focus = focus;

    this.boundingBox.style.fillColor = 'none';
    this.boundingBox.style.strokeColor = this.fullMatchColor;
    this.boundingBox.style.strokeWidth = '1';
    this.boundingBox.style.strokeDashArray = '5 5';
    this.boundingBox.SVG.style.shapeRendering = 'optimizespeed';

    this.boundingBox.removeOverEvent();

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);

    this.clickEvent = this.clickEvent.bind(this);

    this._container.addCallBack(SVGEvent.ELEMENT_ADDED, ({element}: any) => {
      /* if select tool is on, add click event to newly added element */
      if (this._isOn) {
        const callback = this.clickEvent.bind(this, element);
        element.SVG.addEventListener('mousedown', callback);
        element.SVG.addEventListener('touchstart', callback);
        this.elementsClickEvents.push({element, callback});
      }
    });
  }

  private clickEvent(element: ElementView): void {
    if (element.group) {
      element = element.group;
    }

    const hasChild: boolean = this.focus.hasChild(element);
    if (!this._container.isMultiselect && hasChild) {return;}

    if (!this._container.isMultiselect && !hasChild) {
      this._container.blur();
      this._container.focus(element);
    } else if (hasChild) {
      this._container.blur(element);
    } else {
      this._container.focus(element);
    }
  }
  private mouseDownEvent(event: MouseEvent | TouchEvent): void {
    if (event.target !== this._container.HTML) {
      return;
    }
    this._container.HTML.addEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);

    const containerRect: DOMRect = this._container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this._mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseDown(this._mouseCurrentPos);

    this._container.style.changeCursor(Cursor.NO_TOOL);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent): void {
    const containerRect: DOMRect = this._container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this._mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(this._mouseCurrentPos);
  };
  private mouseUpEvent(): void {
    this.makeMouseUp(this._mouseCurrentPos);

    this._container.style.changeCursor(this.cursor);

    this._container.HTML.removeEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);
  };

  public makeMouseDown(position: Point, call: boolean = true): void {
    /* Remove all elements over event, because when selecting element calls highlight event*/
    this.elementsOverEvent = [];
    this._container.elements.forEach((element: ElementView) => {
      this.elementsOverEvent.push({element, overEvent: element.properties.overEvent || false});
      element.removeOverEvent();
    });

    this.position = position;
    this.boundingBox.__setRect__({
      x: position.x,
      y: position.y,
      width: 1,
      height: 1
    });

    this._container.HTML.appendChild(this.boundingBox.SVG);

    if (call) {
      this._container.__call__(SVGEvent.SELECT_AREA_MOUSE_DOWN, {position});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true): void {
    const width: number = position.x - this.position.x;
    const height: number = position.y - this.position.y;

    if (width > 0) {
      this.boundingBox.style.strokeColor = this.fullMatchColor;
    } else {
      this.boundingBox.style.strokeColor = this.intersectionColor;
    }

    for (const element of this._container.elements) {
      if (width > 0) { /* select box drawn from left to right */
        if (ElementView.rectInRect(element.getVisibleRect(), this.boundingBox.getRect())) {
          element.__highlight__();
        } else {
          element.__lowlight__();
        }
      } else { /* if select box drawn from right to left */
        if (element.intersectsRect(this.boundingBox.getRect())) {
          element.__highlight__();
        } else {
          element.__lowlight__();
        }
      }
    }

    this.boundingBox.__drawSize__({
      x: this.position.x,
      y: this.position.y,
      width,
      height
    });

    if (call) {
      this._container.__call__(SVGEvent.SELECT_AREA_MOUSE_MOVE, {position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true): void {
    /* Recover elements over event. (Over event removed in makeMouseDown method) */
    this.elementsOverEvent.forEach((elementOverEvent: {element: ElementView; overEvent: boolean}) => {
      if (elementOverEvent.overEvent) {
        elementOverEvent.element.setOverEvent();
      }
    });
    const width: number = position.x - this.position.x;

    this._container.HTML.removeChild(this.boundingBox.SVG);

    for (const element of this._container.elements) {
      if (width > 0) { /* select box drawn from left to right */
        if (ElementView.rectInRect(element.getVisibleRect(), this.boundingBox.getRect())) {
          this._container.focus(element, true, undefined, false);
        }
      } else { /* if select box drawn from right to left */
        if (element.intersectsRect(this.boundingBox.getRect())) {
          this._container.focus(element, true, undefined, false);
        }
      }
      element.__lowlight__();
    }

    if (call) {
      this._container.__call__(SVGEvent.SELECT_AREA_MOUSE_UP, {position});
      this._container.__call__(SVGEvent.ELEMENTS_FOCUSED, {elements: this._container.focused.children});
    }
  }

  public override on(call: boolean = true): boolean {
    if (!super.on(call)) {
      return false;
    }
    this._container.HTML.addEventListener('mousedown', this.mouseDownEvent);
    this._container.HTML.addEventListener('touchstart', this.mouseDownEvent);
    this.elementsClickEvents = [];
    this._container.elementsDeep.forEach((element: ElementView) => {
      const clickEvent = this.clickEvent.bind(this, element);
      element.SVG.addEventListener('mousedown', clickEvent);
      element.SVG.addEventListener('touchstart', clickEvent);
      this.elementsClickEvents.push({element, callback: clickEvent});
    });

    this.dragTool.on(false);

    this._container.style.changeCursor(this.cursor);
    if (call) {
      this._container.__call__(SVGEvent.SELECT_TOOl_ON);
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

    this.dragTool.off(false);

    if (call) {
      this._container.__call__(SVGEvent.SELECT_TOOl_OFF);
    }
    return true;
  }
}
