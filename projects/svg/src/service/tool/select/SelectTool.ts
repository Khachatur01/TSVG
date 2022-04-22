import {Tool} from "../Tool";
import {Container} from "../../../Container";
import {RectangleView} from "../../../element/shape/pointed/polygon/rectangle/RectangleView";
import {Point} from "../../../model/Point";
import {DragTool} from "../drag/DragTool";
import {Event} from "../../../dataSource/constant/Event";
import {Focus} from "../../edit/group/Focus";
import {Cursor} from "../../../dataSource/constant/Cursor";

export class SelectTool extends Tool {
  private readonly boundingBox: RectangleView;
  private position: Point = {x: 0, y: 0};
  public readonly dragTool: DragTool;
  public focus: Focus;

  private _start = this.start.bind(this);
  private _select = this.select.bind(this);
  private _end = this.end.bind(this);

  public constructor(container: Container, focus: Focus) {
    super(container);
    this.boundingBox = new RectangleView(container);
    this.dragTool = new DragTool(container, focus);
    this.focus = focus;

    this.boundingBox.style.fillColor = "none";
    this.boundingBox.style.strokeColor = "#1545ff";
    this.boundingBox.style.strokeWidth = "1";
    this.boundingBox.style.strokeDashArray = "5 5";

    this.boundingBox.removeOverEvent();
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    this.position = position;
    this.boundingBox.__setRect__({
      x: position.x,
      y: position.y,
      width: 1,
      height: 1
    });

    this._container.HTML.appendChild(this.boundingBox.SVG);

    if (call) {
      this._container.__call__(Event.SELECT_AREA_MOUSE_DOWN, {position: position});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    let width = position.x - this.position.x;
    let height = position.y - this.position.y;

    this.boundingBox.__drawSize__({
      x: this.position.x,
      y: this.position.y,
      width: width,
      height: height
    });

    if (call) {
      this._container.__call__(Event.SELECT_AREA_MOUSE_MOVE, {position: position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    let width = position.x - this.position.x;

    this._container.HTML.removeChild(this.boundingBox.SVG);
    let boxPos = this.boundingBox.getRect();
    let boxSize = this.boundingBox.getRect();
    let boxPoints: any = {
      topLeft: boxPos,
      bottomRight: {
        x: boxPos.x + boxSize.width,
        y: boxPos.y + boxSize.height
      }
    };

    this._container.multiSelect();

    elementsLoop:
      for (let element of this._container.elements) {
        let elementPoints = element.visiblePoints;

        if (width > 0) {/* if select box drawn from right to left */
          for (let point of elementPoints)
            if (/* full match */
              point.x < boxPoints.topLeft.x || point.x > boxPoints.bottomRight.x ||
              point.y < boxPoints.topLeft.y || point.y > boxPoints.bottomRight.y
            )
              continue elementsLoop;

          this._container.focus(element, true, false);
        } else {/* if select box drawn from left to right */
          for (let point of elementPoints)
            if (/* one point match */
              point.x > boxPoints.topLeft.x && point.x < boxPoints.bottomRight.x &&
              point.y > boxPoints.topLeft.y && point.y < boxPoints.bottomRight.y
            ) {
              this._container.focus(element, true, false);
              break;
            }
        }
      }
    this._container.singleSelect();

    if (call) {
      this._container.__call__(Event.SELECT_AREA_MOUSE_UP, {position: position});
    }
  }

  private start(event: MouseEvent | TouchEvent): void {
    if (event.target != this._container.HTML) return;
    this._container.HTML.addEventListener("mousemove", this._select);
    this._container.HTML.addEventListener("touchmove", this._select);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();
    let containerRect = this._container.HTML.getBoundingClientRect();

    let startPosition = {
      x: eventPosition.x - containerRect.left, // x position within the element.
      y: eventPosition.y - containerRect.top // y position within the element.
    };
    this.makeMouseDown(startPosition);
  }
  private select(event: MouseEvent | TouchEvent): void {
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();
    let containerRect = this._container.HTML.getBoundingClientRect();
    let movePosition = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(movePosition);
  }
  private end(event: MouseEvent | TouchEvent): void {
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();
    let containerRect = this._container.HTML.getBoundingClientRect();
    let endPosition = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    }

    this.makeMouseUp(endPosition);

    this._container.HTML.removeEventListener("mousemove", this._select);
    this._container.HTML.removeEventListener("touchmove", this._select);
    document.removeEventListener("mouseup", this._end);
    document.removeEventListener("touchend", this._end);
  }

  protected _on(call: boolean = true): void {
    this._container.HTML.addEventListener("mousedown", this._start);
    this._container.HTML.addEventListener("touchstart", this._start);
    this._isOn = true;
    this.dragTool.on(call);

    this._container.style.changeCursor(Cursor.SELECT);
    if (call) {
      this._container.__call__(Event.SELECT_TOOl_ON);
    }
  }
  public off(call: boolean = true): void {
    this._container.HTML.removeEventListener("mousedown", this._start);
    this._container.HTML.removeEventListener("touchstart", this._start);
    this._isOn = false;
    this.dragTool.off(call);

    if (call) {
      this._container.__call__(Event.SELECT_TOOl_OFF);
    }
  }
}
