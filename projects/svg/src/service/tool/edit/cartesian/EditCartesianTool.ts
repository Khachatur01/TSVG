import {Tool} from '../../Tool';
import {Cursor} from '../../../../dataSource/constant/Cursor';
import {CartesianEditable} from '../../../../element/complex/cartesian/CartesianEditable';
import {Point} from '../../../../model/Point';
import {Focus} from '../../../edit/group/Focus';
import {Container} from '../../../../Container';
import {ElementView} from '../../../../element/ElementView';
import {SVGEvent} from '../../../../dataSource/constant/SVGEvent';
import {CartesianView} from '../../../../element/complex/cartesian/CartesianView';
import {GraphicView} from '../../../../element/complex/cartesian/GraphicView';
import {RayView} from '../../../../element/complex/cartesian/RayView';

export class EditCartesianTool extends Tool {
  protected override _cursor: Cursor = Cursor.EDIT_NODE;
  private _editableElement: CartesianEditable | null = null;
  protected _mouseStartPos: Point = {x: 0, y: 0};
  public focus: Focus;

  public constructor(container: Container, focus: Focus) {
    super(container);
    this.focus = focus;

    this.mouseWheelEvent = this.mouseWheelEvent.bind(this);
    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  protected mouseWheelEvent(event: WheelEvent): void {
    if (event.deltaY < 0) {
      this._editableElement?.zoomIn(1.5);
    } else {
      this._editableElement?.zoomOut(1.5);
    }
    event.preventDefault();
  }
  private mouseDownEvent(event: MouseEvent | TouchEvent): void {
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

    this._container.HTML.removeEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);
  };

  public makeMouseDown(position: Point, call: boolean = true): void {
    this._editableElement?.__fixRect__();
    this._mouseStartPos = Object.assign({}, position);
  }
  public makeMouseMove(position: Point, call: boolean = true): void {
    this._editableElement?.__moveOrigin__({
      x: position.x - this._mouseStartPos.x,
      y: position.y - this._mouseStartPos.y,
    });
  }
  public makeMouseUp(position: Point, call: boolean = true): void {}

  public get editableElement(): CartesianEditable | null {
    return this._editableElement;
  }
  public set editableElement(editableElement: CartesianEditable | null) {
    if (!editableElement) {
      return;
    }
    this.removeEditableElement();

    this.focus.appendChild(editableElement as unknown as ElementView, false, false);
    this._editableElement = editableElement;
    this._editableElement.__onFocus__();
  }
  public removeEditableElement(): void {
    if (!this._editableElement) {
      return;
    }

    this.focus.removeChild(this._editableElement as unknown as ElementView, false);
    this._editableElement = null;
  }

  public override on(call: boolean = true): boolean {
    if (!super.on(call)) {
      return false;
    }
    this.focus.children.forEach((child: ElementView) => {
      if (
        child instanceof CartesianView ||
        child instanceof GraphicView ||
        child instanceof RayView
      ) {
        this.editableElement = child;
      }
    });
    this._container.blur();

    if (this._editableElement) {
      this._container.HTML.addEventListener('wheel', this.mouseWheelEvent);
      this._container.HTML.addEventListener('mousedown', this.mouseDownEvent);
      this._container.HTML.addEventListener('touchstart', this.mouseDownEvent);
    }

    this._container.style.changeCursor(this.cursor);
    if (call) {
      this._container.__call__(SVGEvent.EDIT_COORDINATE_PLANE_TOOL_ON);
    }
    return true;
  }
  public override off(call: boolean = true): boolean {
    if (!super.off(call)) {
      return false;
    }
    this.focus.clear();

    if (this._editableElement) {
      this._container.HTML.removeEventListener('wheel', this.mouseWheelEvent);
      this._container.HTML.removeEventListener('mousedown', this.mouseDownEvent);
      this._container.HTML.removeEventListener('touchstart', this.mouseDownEvent);
    }
    this.removeEditableElement();

    if (call) {
      this._container.__call__(SVGEvent.EDIT_COORDINATE_PLANE_TOOL_OFF);
    }
    return true;
  }
}
