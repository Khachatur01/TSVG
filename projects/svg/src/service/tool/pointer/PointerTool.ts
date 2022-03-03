import {Tool} from "../Tool";
import {TSVG} from "../../../TSVG";
import {Callback} from "../../../dataSource/Callback";
import {ElementView} from "../../../element/ElementView";
import {Point} from "../../../model/Point";

export class PointerTool extends Tool {
  private _cursor: string = "../assets/img/pointer.svg";
  private readonly _cursorSVG: SVGElement;

  private _start = this.start.bind(this);
  private _move = this.move.bind(this);
  private _end = this.end.bind(this);

  public constructor(container: TSVG) {
    super(container);
    this._cursorSVG = document.createElementNS(ElementView.svgURI, "image");
    this._cursorSVG.setAttribute("href", this._cursor);
    this._cursorSVG.setAttribute("x", "-40");
    this._cursorSVG.setAttribute("y", "-60");
    this._cursorSVG.setAttribute("width", "40");
    this._cursorSVG.setAttribute("height", "60");
  }

  public makeMouseDown(position: Point) {}
  public makeMouseMove(position: Point) {
    this._cursorSVG.setAttribute("x", position.x + "");
    this._cursorSVG.setAttribute("y", position.y + "");
  }
  public makeMouseUp(position: Point) {}

  public get cursor(): string {
    return "url(" + this._cursor + "), auto";
  }
  public set cursor(URI: string) {
    this._cursor = URI;
  }

  private start(): void {
    this._container.HTML.addEventListener("touchmove", this._move);
    document.addEventListener("touchend", this._end);
  }
  private move(event: TouchEvent): void {
    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let movePosition = {
      x: eventPosition.x - containerRect.left - 60,
      y: eventPosition.y - containerRect.top - 60
    };
    this.makeMouseMove(movePosition);
  }
  private end(): void {
    this._container.HTML.removeEventListener("touchmove", this._move);
    document.removeEventListener("touchend", this._end);
  }

  protected _on(): void {
    if (this._container.mouseEventSwitches.pointer) {
      this._container.HTML.addEventListener("touchstart", this._start);
      this._container.HTML.style.cursor = this.cursor;
    }
    this._isOn = true;
    this._container.blur();
    this._container.HTML.appendChild(this._cursorSVG);

    this._container.call(Callback.POINTER_TOOl_ON);
  }

  public off(): void {
    this._container.HTML.removeEventListener("touchstart", this._start);
    this._isOn = false;
    this._container.HTML.removeChild(this._cursorSVG);

    this._container.call(Callback.POINTER_TOOl_OFF);
  }
}
