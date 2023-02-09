import {Container} from '../../../Container';
import {Point} from '../../../model/Point';
import {Tool} from '../Tool';
import {SVGEvent} from '../../../dataSource/constant/SVGEvent';
import {Focus} from '../../edit/group/Focus';
import {Cursor} from '../../../dataSource/constant/Cursor';

export class DragTool extends Tool {
  protected override _cursor: Cursor = Cursor.SELECT;
  private mouseStartPos: Point = {x: 0, y: 0};
  private elementStartPos: Point = {x: 0, y: 0};
  public focus: Focus;


  constructor(container: Container, focus: Focus) {
    super(container);
    this.focus = focus;

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  private mouseDownEvent(event: MouseEvent | TouchEvent) {
    if (event.target === this._container.HTML || this.focus.children.size === 0) {
      return;
    }
    this._container.HTML.addEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);

    const containerRect = this.container.HTML.getBoundingClientRect();
    const eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseDown(this._mouseCurrentPos);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent) {
    const containerRect = this.container.HTML.getBoundingClientRect();
    const eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(this._mouseCurrentPos);
  };
  private mouseUpEvent() {
    this._container.HTML.removeEventListener('mousemove', this.mouseMoveEvent);
    this._container.HTML.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);

    this.makeMouseUp(this._mouseCurrentPos);
  };

  public makeMouseDown(position: Point, call: boolean = true) {
    this.mouseStartPos = position;
    this.focus.__fixRect__();
    this.focus.__fixRefPoint__();
    this.elementStartPos = this.focus.__lastRect__;

    this.focus.highlight();

    if (call) {
      this._container.__call__(SVGEvent.DRAG_MOUSE_DOWN, {position, elements: this.focus.children});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    this.focus.__translate__({
      x: position.x - this.mouseStartPos.x,
      y: position.y - this.mouseStartPos.y
    });

    if (call) {
      this._container.__call__(SVGEvent.DRAG_MOUSE_MOVE, {position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    this.focus.__translate__({
      x: 0,
      y: 0
    });
    const delta: Point = {
      x: position.x - this.mouseStartPos.x,
      y: position.y - this.mouseStartPos.y
    };
    this.focus.__drag__(delta);
    this.focus.lowlight();

    const focusPosition: Point = {
      x: this.focus.boundingBox.getRect().x,
      y: this.focus.boundingBox.getRect().y,
    };
    if (call) {
      this._container.__call__(SVGEvent.DRAG_MOUSE_UP, {position});
      this._container.__call__(SVGEvent.ELEMENTS_DRAGGED, {
        elements: this.focus.children,
        angle: this.focus.angle,
        refPoint: this.focus.refPoint,
        position: focusPosition,
        delta
      });
    }
  }

  public override on(call: boolean = true): boolean {
    /* don't call super.on() function, that turns off previous tool. because previous tool is select tool */
    this._isOn = true;
    this._container.HTML.addEventListener('mousedown', this.mouseDownEvent);
    this._container.HTML.addEventListener('touchstart', this.mouseDownEvent);

    if (call) {
      this._container.__call__(SVGEvent.DRAG_TOOL_ON);
    }
    return true;
  }
  public override off(call: boolean = true): boolean {
    if (!super.off(call)) {
      return false;
    }
    this._container.HTML.removeEventListener('mousedown', this.mouseDownEvent);
    this._container.HTML.removeEventListener('touchstart', this.mouseDownEvent);

    if (call) {
      this._container.__call__(SVGEvent.DRAG_TOOL_OFF);
    }
    return true;
  }
}
