import {Tool} from "../Tool";
import {TSVG} from "../../../TSVG";
import {Callback} from "../../../dataSource/constant/Callback";
import {ElementView} from "../../../element/ElementView";
import {Point} from "../../../model/Point";

export class PointerTool extends Tool {
  private readonly _cursorSVG: SVGElement;

  private _move = this.move.bind(this);

  public constructor(container: TSVG, URI: string) {
    super(container);
    this._cursorSVG = document.createElementNS(ElementView.svgURI, "image");
    this._cursorSVG.setAttribute("href", URI);
    this.hideCursor();
  }

  public makeMouseDown(position: Point, call: boolean = true) {}
  public makeMouseMove(position: Point, call: boolean = true) {
    this._cursorSVG.setAttribute("x", position.x + "");
    this._cursorSVG.setAttribute("y", position.y + "");

    if (call) {
      this._container.call(Callback.POINTER_MOVE, {position: position});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {}

  public setCursor(URI: string, call: boolean = true) {
    this._cursorSVG.setAttribute("href", URI);

    if (call) {
      this._container.call(Callback.POINTER_CHANGE, {URI: URI});
    }
  }
  private move(event: TouchEvent | MouseEvent): void {
    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let movePosition = {
      x: eventPosition.x - containerRect.left - 60,
      y: eventPosition.y - containerRect.top - 60
    };
    this.makeMouseMove(movePosition);
  }

  private hideCursor(): void {
    this._cursorSVG.setAttribute("x", "-40");
    this._cursorSVG.setAttribute("y", "-60");
    this._cursorSVG.setAttribute("width", "40");
    this._cursorSVG.setAttribute("height", "60");
  }

  public get SVG(): SVGElement {
    return this._cursorSVG;
  }

  protected _on(call: boolean = true): void {
    document.addEventListener("touchmove", this._move);
    document.addEventListener("mousemove", this._move);
    this._container.HTML.style.cursor = "none";
    this._isOn = true;
    this._container.blur();

    this.hideCursor();

    if (call) {
      this._container.call(Callback.POINTER_TOOl_ON);
    }
  }
  public off(call: boolean = true): void {
    document.removeEventListener("touchstart", this._move);
    document.removeEventListener("mousemove", this._move);
    this._container.HTML.style.cursor = "default";
    this._isOn = false;

    this.hideCursor();

    if (call) {
      this._container.call(Callback.POINTER_TOOl_OFF);
    }
  }
}
