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
  public intersectionColor = 'green';
  public fullMatchColor = '#1545ff';

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
  }

  private mouseDownEvent(event: MouseEvent | TouchEvent) {
    if (event.target !== this._container.HTML) {
      return;
    }
    this._container.HTML.addEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);

    const containerRect = this._container.HTML.getBoundingClientRect();
    const eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = {
      x: eventPosition.x - containerRect.left, // x position within the element.
      y: eventPosition.y - containerRect.top // y position within the element.
    };
    this.makeMouseDown(this._mouseCurrentPos);

    this._container.style.changeCursor(Cursor.NO_TOOL);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent) {
    const containerRect = this._container.HTML.getBoundingClientRect();
    const eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(this._mouseCurrentPos);
  };
  private mouseUpEvent() {
    this.makeMouseUp(this._mouseCurrentPos);

    this._container.style.changeCursor(this.cursor);

    this._container.HTML.removeEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);
  };

  public makeMouseDown(position: Point, call: boolean = true) {
    /*
    * Remove all elements over event, because when selecting element calls highlight event
    */
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
  public makeMouseMove(position: Point, call: boolean = true) {
    const width = position.x - this.position.x;
    const height = position.y - this.position.y;

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
  public makeMouseUp(position: Point, call: boolean = true) {
    /*
    * Recover elements over event. (Over event removed in makeMouseDown method)
    */
    this.elementsOverEvent.forEach((elementOverEvent) => {
      if (elementOverEvent.overEvent) {
        elementOverEvent.element.setOverEvent();
      }
    });
    const width = position.x - this.position.x;

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
    this.dragTool.off(false);

    if (call) {
      this._container.__call__(SVGEvent.SELECT_TOOl_OFF);
    }
    return true;
  }
}
