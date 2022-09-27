import {Tool} from "../Tool";
import {Container} from "../../../Container";
import {RectangleView} from "../../../element/shape/pointed/polygon/rectangle/RectangleView";
import {Point} from "../../../model/Point";
import {DragTool} from "../drag/DragTool";
import {Event} from "../../../dataSource/constant/Event";
import {Focus} from "../../edit/group/Focus";
import {Cursor} from "../../../dataSource/constant/Cursor";
import {ElementView} from "../../../element/ElementView";

export class SelectTool extends Tool {
  protected override _cursor: Cursor = Cursor.SELECT;
  private readonly boundingBox: RectangleView;
  private position: Point = {x: 0, y: 0};
  public readonly dragTool: DragTool;
  public focus: Focus;
  public intersectionColor: string = "green";
  public fullMatchColor: string = "#1545ff";

  private elementsOverEvent: {element: ElementView, overEvent: boolean}[] = [];

  public constructor(container: Container, focus: Focus) {
    super(container);
    this.boundingBox = new RectangleView(container);
    this.dragTool = new DragTool(container, focus);
    this.focus = focus;

    this.boundingBox.style.fillColor = "none";
    this.boundingBox.style.strokeColor = this.fullMatchColor;
    this.boundingBox.style.strokeWidth = "1";
    this.boundingBox.style.strokeDashArray = "5 5";
    this.boundingBox.SVG.style.shapeRendering = "optimizespeed";

    this.boundingBox.removeOverEvent();

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  private mouseDownEvent(event: MouseEvent | TouchEvent) {
    if (event.target != this._container.HTML) return;
    this._container.HTML.addEventListener("mousemove", this.mouseMoveEvent);
    this._container.HTML.addEventListener("touchmove", this.mouseMoveEvent);
    document.addEventListener("mouseup", this.mouseUpEvent);
    document.addEventListener("touchend", this.mouseUpEvent);

    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = {
      x: eventPosition.x - containerRect.left, // x position within the element.
      y: eventPosition.y - containerRect.top // y position within the element.
    };
    this.makeMouseDown(this._mouseCurrentPos);

    this._container.style.changeCursor(Cursor.NO_TOOL);
  };
  private mouseMoveEvent(event: MouseEvent | TouchEvent) {
    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    this._mouseCurrentPos = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(this._mouseCurrentPos);
  };
  private mouseUpEvent() {
    this.makeMouseUp(this._mouseCurrentPos);

    this._container.style.changeCursor(this.cursor);

    this._container.HTML.removeEventListener("mousemove", this.mouseMoveEvent);
    this._container.HTML.removeEventListener("touchmove", this.mouseMoveEvent);
    document.removeEventListener("mouseup", this.mouseUpEvent);
    document.removeEventListener("touchend", this.mouseUpEvent);
  };

  public makeMouseDown(position: Point, call: boolean = true) {
    /*
    * Remove all elements over event, because when selecting element calls highlight event
    */
    this.elementsOverEvent = [];
    this._container.elements.forEach((element: ElementView) => {
      this.elementsOverEvent.push({element: element, overEvent: element.properties.overEvent || false});
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
      this._container.__call__(Event.SELECT_AREA_MOUSE_DOWN, {position: position});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    let width = position.x - this.position.x;
    let height = position.y - this.position.y;

    if (width > 0) {
      this.boundingBox.style.strokeColor = this.fullMatchColor;
    } else {
      this.boundingBox.style.strokeColor = this.intersectionColor;
    }

    for (let element of this._container.elements) {
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
      width: width,
      height: height
    });

    if (call) {
      this._container.__call__(Event.SELECT_AREA_MOUSE_MOVE, {position: position});
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
    let width = position.x - this.position.x;

    this._container.HTML.removeChild(this.boundingBox.SVG);

    for (let element of this._container.elements) {
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
      this._container.__call__(Event.SELECT_AREA_MOUSE_UP, {position: position});
      this._container.__call__(Event.ELEMENTS_FOCUSED, {elements: this._container.focused.children});
    }
  }

  public override on(call: boolean = true): void {
    super.on(call);
    this._container.HTML.addEventListener("mousedown", this.mouseDownEvent);
    this._container.HTML.addEventListener("touchstart", this.mouseDownEvent);
    this.dragTool.on(false);

    this._container.style.changeCursor(this.cursor);
    if (call) {
      this._container.__call__(Event.SELECT_TOOl_ON);
    }
  }
  public override off(call: boolean = true): void {
    super.off(call);
    this._container.HTML.removeEventListener("mousedown", this.mouseDownEvent);
    this._container.HTML.removeEventListener("touchstart", this.mouseDownEvent);
    this.dragTool.off(false);

    if (call) {
      this._container.__call__(Event.SELECT_TOOl_OFF);
    }
  }
}
