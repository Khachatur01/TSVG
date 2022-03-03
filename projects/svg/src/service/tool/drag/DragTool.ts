import {TSVG} from "../../../TSVG";
import {Point} from "../../../model/Point";
import {ElementView} from "../../../element/ElementView";
import {Tool} from "../Tool";
import {Callback} from "../../../dataSource/Callback";

export class DragTool extends Tool {
  private mouseStartPos: Point = {x: 0, y: 0};
  private elementStartPos: Point = {x: 0, y: 0};

  private _dragStart = this.dragStart.bind(this);
  private _drag = this.drag.bind(this);
  private _dragEnd = this.dragEnd.bind(this);

  constructor(container: TSVG) {
    super(container);
  }

  public makeMouseDown(position: Point) {
    this.mouseStartPos.x = position.x;
    this.mouseStartPos.y = position.y;
    this._container.focused.fixPosition();
    this._container.focused.fixRefPoint();
    this.elementStartPos = this._container.focused.lastRect;

    this._container.focused?.children.forEach((child: ElementView) => {
      child.fixRect();
    });
    this._container.focused.highlight();

    this._container.call(Callback.DRAG_START);
  }
  public makeMouseMove(position: Point) { /* delta */
    this._container.focused.translate = {
      x: position.x - this.mouseStartPos.x,
      y: position.y - this.mouseStartPos.y
    };

    this._container.call(Callback.DRAG, {position: position});
  }
  public makeMouseUp(position: Point) {
    this._container.focused.translate = {
      x: 0,
      y: 0
    };
    this._container.focused.position = { /* delta */
      x: position.x - this.mouseStartPos.x,
      y: position.y - this.mouseStartPos.y
    };

    this._container.HTML.removeEventListener("mousemove", this._drag);
    this._container.HTML.removeEventListener("touchmove", this._drag);
    document.removeEventListener("mouseup", this._dragEnd);
    document.removeEventListener("touchend", this._dragEnd);
    this._container.focused.lowlight();

    this._container.call(Callback.DRAG_END, {position: position});
  }

  private dragStart(event: MouseEvent | TouchEvent) {
    if (event.target == this._container.HTML) return;
    this._container.HTML.addEventListener("mousemove", this._drag);
    this._container.HTML.addEventListener("touchmove", this._drag);
    document.addEventListener("mouseup", this._dragEnd);
    document.addEventListener("touchend", this._dragEnd);

    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();
    this.makeMouseDown(eventPosition);
  }
  private drag(event: MouseEvent | TouchEvent) {
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();
    this.makeMouseMove(eventPosition);
  }
  private dragEnd(event: MouseEvent | TouchEvent) {
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();
    this.makeMouseUp(eventPosition);
  }

  override on() {
    /* don't off previous tool, because previous tool is select tool */
    this._on();
  }

  public _on(): void {
    if (this._container.mouseEventSwitches.drag) {
      this._container.HTML.addEventListener("mousedown", this._dragStart);
      this._container.HTML.addEventListener("touchstart", this._dragStart);
    }
    this._isOn = true;

    this._container.call(Callback.DRAG_TOOL_ON);
  }

  public off(): void {
    this._container.HTML.removeEventListener("mousedown", this._dragStart);
    this._container.HTML.removeEventListener("touchstart", this._dragStart);
    this._isOn = false;

    this._container.call(Callback.DRAG_TOOL_OFF);
  }
}
