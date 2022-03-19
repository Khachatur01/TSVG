import {TSVG} from "../../../TSVG";
import {Point} from "../../../model/Point";
import {ElementView} from "../../../element/ElementView";
import {Tool} from "../Tool";
import {Callback} from "../../../dataSource/constant/Callback";
import {Focus} from "../../edit/group/Focus";

export class DragTool extends Tool {
  private mouseStartPos: Point = {x: 0, y: 0};
  private elementStartPos: Point = {x: 0, y: 0};
  public focus: Focus;

  private _dragStart = this.dragStart.bind(this);
  private _drag = this.drag.bind(this);
  private _dragEnd = this.dragEnd.bind(this);

  constructor(container: TSVG, focus: Focus) {
    super(container);
    this.focus = focus;
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    this.mouseStartPos = position;
    this.focus.fixPosition();
    this.focus.fixRefPoint();
    this.elementStartPos = this.focus.lastRect;

    this.focus.children.forEach((child: ElementView) => {
      child.fixRect();
    });
    this.focus.highlight();

    if (call) {
      this._container.call(Callback.DRAG_MOUSE_DOWN, {position: position, elements: this.focus.children});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    this.focus.translate = {
      x: position.x - this.mouseStartPos.x,
      y: position.y - this.mouseStartPos.y
    };

    if (call) {
      this._container.call(Callback.DRAG_MOUSE_MOVE, {position: position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    this.focus.translate = {
      x: 0,
      y: 0
    };
    this.focus.position = { /* delta */
      x: position.x - this.mouseStartPos.x,
      y: position.y - this.mouseStartPos.y
    };
    this.focus.lowlight();

    if (call) {
      this._container.call(Callback.DRAG_MOUSE_UP, {position: position});
    }
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
    this._container.HTML.removeEventListener("mousemove", this._drag);
    this._container.HTML.removeEventListener("touchmove", this._drag);
    document.removeEventListener("mouseup", this._dragEnd);
    document.removeEventListener("touchend", this._dragEnd);

    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();
    this.makeMouseUp(eventPosition);
  }

  override on(call?: boolean) {
    /* don't off previous tool, because previous tool is select tool */
    this._on(call);
  }

  public _on(call: boolean = true): void {
    this._container.HTML.addEventListener("mousedown", this._dragStart);
    this._container.HTML.addEventListener("touchstart", this._dragStart);
    this._isOn = true;

    if (call) {
      this._container.call(Callback.DRAG_TOOL_ON);
    }
  }
  public off(call: boolean = true): void {
    this._container.HTML.removeEventListener("mousedown", this._dragStart);
    this._container.HTML.removeEventListener("touchstart", this._dragStart);
    this._isOn = false;

    if (call) {
      this._container.call(Callback.DRAG_TOOL_OFF);
    }
  }
}
