import {Container} from "../../../Container";
import {Point} from "../../../model/Point";
import {Tool} from "../Tool";
import {Event} from "../../../dataSource/constant/Event";
import {Focus} from "../../edit/group/Focus";
import {Cursor} from "../../../dataSource/constant/Cursor";

export class DragTool extends Tool {
  protected override _cursor: Cursor = Cursor.SELECT;
  private mouseStartPos: Point = {x: 0, y: 0};
  private elementStartPos: Point = {x: 0, y: 0};
  public focus: Focus;

  private _dragStart = this.dragStart.bind(this);
  private _drag = this.drag.bind(this);
  private _dragEnd = this.dragEnd.bind(this);

  constructor(container: Container, focus: Focus) {
    super(container);
    this.focus = focus;
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    this.mouseStartPos = position;
    this.focus.__fixRect__();
    this.focus.__fixRefPoint__();
    this.elementStartPos = this.focus.__lastRect__;

    this.focus.highlight();

    if (call) {
      this._container.__call__(Event.DRAG_MOUSE_DOWN, {position: position, elements: this.focus.children});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    this.focus.__translate__({
      x: position.x - this.mouseStartPos.x,
      y: position.y - this.mouseStartPos.y
    });

    if (call) {
      this._container.__call__(Event.DRAG_MOUSE_MOVE, {position: position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    this.focus.__translate__({
      x: 0,
      y: 0
    });
    let delta = {
      x: position.x - this.mouseStartPos.x,
      y: position.y - this.mouseStartPos.y
    };
    this.focus.__drag__(delta);
    this.focus.lowlight();

    if (call) {
      this._container.__call__(Event.DRAG_MOUSE_UP, {position: position});
      this._container.__call__(Event.ELEMENTS_DRAGGED, {elements: this.focus.children, delta: delta});
    }
  }

  private dragStart(event: MouseEvent | TouchEvent) {
    if (event.target == this._container.HTML || this.focus.children.size === 0) return;
    this._container.HTML.addEventListener("mousemove", this._drag);
    this._container.HTML.addEventListener("touchmove", this._drag);
    document.addEventListener("mouseup", this._dragEnd);
    document.addEventListener("touchend", this._dragEnd);

    let containerRect = this.container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseDown(this._mouseCurrentPos);
  }
  private drag(event: MouseEvent | TouchEvent) {
    let containerRect = this.container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(this._mouseCurrentPos);
  }
  private dragEnd() {
    this._container.HTML.removeEventListener("mousemove", this._drag);
    this._container.HTML.removeEventListener("touchmove", this._drag);
    document.removeEventListener("mouseup", this._dragEnd);
    document.removeEventListener("touchend", this._dragEnd);

    this.makeMouseUp(this._mouseCurrentPos);
  }

  public override on(call: boolean = true): void {
    /* don't call super.on() function, that turns off previous tool. because previous tool is select tool */
    this._isOn = true;
    this._container.HTML.addEventListener("mousedown", this._dragStart);
    this._container.HTML.addEventListener("touchstart", this._dragStart);

    if (call) {
      this._container.__call__(Event.DRAG_TOOL_ON);
    }
  }
  public override off(call: boolean = true): void {
    super.off(call);
    this._container.HTML.removeEventListener("mousedown", this._dragStart);
    this._container.HTML.removeEventListener("touchstart", this._dragStart);

    if (call) {
      this._container.__call__(Event.DRAG_TOOL_OFF);
    }
  }
}
