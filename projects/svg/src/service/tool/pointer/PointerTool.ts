import {Tool} from "../Tool";
import {Container} from "../../../Container";
import {Event} from "../../../dataSource/constant/Event";
import {ElementView} from "../../../element/ElementView";
import {Point} from "../../../model/Point";
import {Cursor} from "../../../dataSource/constant/Cursor";

export class PointerTool extends Tool {
  private readonly _cursorSVG: SVGElement;

  private _move = this.move.bind(this);

  public constructor(container: Container, URI: string) {
    super(container);
    this._cursorSVG = document.createElementNS(ElementView.svgURI, "image");
    this._cursorSVG.setAttribute("href", URI);
    this.hide();
  }

  public makeMouseDown(position: Point, call: boolean = true) {}
  public makeMouseMove(position: Point, call: boolean = true) {
    this._cursorSVG.setAttribute("x", position.x + "");
    this._cursorSVG.setAttribute("y", position.y + "");

    if (call) {
      this._container.__call__(Event.POINTER_MOVE, {position: position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {}

  public setCursor(URI: string, call: boolean = true) {
    this._cursorSVG.setAttribute("href", URI);

    if (call) {
      this._container.__call__(Event.POINTER_CHANGE, {URI: URI});
    }
  }
  private move(event: TouchEvent | MouseEvent): void {
    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    event.stopImmediatePropagation();

    let movePosition = {
      x: eventPosition.x - containerRect.left - 60,
      y: eventPosition.y - containerRect.top - 60
    };
    this.makeMouseMove(movePosition);
  }

  private hide(): void {
    this._cursorSVG.setAttribute("x", "-40");
    this._cursorSVG.setAttribute("y", "-60");
    this._cursorSVG.setAttribute("width", "40");
    this._cursorSVG.setAttribute("height", "60");
  }

  public get SVG(): SVGElement {
    return this._cursorSVG;
  }

  public override on(call: boolean = true): void {
    super.on(call);
    document.addEventListener("touchmove", this._move);
    document.addEventListener("mousemove", this._move);
    this._isOn = true;
    this._container.blur();
    this.hide();

    this._container.style.changeCursor(Cursor.POINTER);
    if (call) {
      this._container.__call__(Event.POINTER_TOOl_ON);
    }
  }
  public override off(call: boolean = true): void {
    super.off();
    document.removeEventListener("touchmove", this._move);
    document.removeEventListener("mousemove", this._move);
    this._container.HTML.style.cursor = "default";
    this._isOn = false;
    this.hide();

    if (call) {
      this._container.__call__(Event.POINTER_TOOl_OFF);
    }
  }
}
