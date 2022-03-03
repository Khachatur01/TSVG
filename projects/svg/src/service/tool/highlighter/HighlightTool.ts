import {Tool} from "../Tool";
import {TSVG} from "../../../TSVG";
import {Callback} from "../../../dataSource/Callback";
import {PathView} from "../../../element/shape/pointed/PathView";
import {Path} from "../../../model/path/Path";
import {MoveTo} from "../../../model/path/point/MoveTo";
import {LineTo} from "../../../model/path/line/LineTo";
import {ElementView} from "../../../element/ElementView";
import {Point} from "../../../model/Point";

export class HighlightTool extends Tool {
  private _timeout: number = 3000;
  private _color: string = "#7efca0AA";
  private _width: string = "20";
  private path: PathView | null = null;
  private readonly group: SVGGElement;

  private _start = this.start.bind(this);
  private _highlight = this.highlight.bind(this);
  private _end = this.end.bind(this);

  public constructor(container: TSVG) {
    super(container);
    this.group = document.createElementNS(ElementView.svgURI, "g");
    this.group.id = "highlight";
  }

  public makeMouseDown(position: Point) {
    let start = new Path();
    start.add(
      new MoveTo(position)
    );

    this.path = new PathView(this._container, start);
    this.path.removeOverEvent();
    this.path.style.strokeWidth = this._width;
    this.path.style.strokeColor = this._color;
    this.path.style.fillColor = "none";

    this.group.appendChild(this.path.SVG);
  }
  public makeMouseMove(position: Point) {
    this.path?.addCommand(new LineTo(position));
  }
  public makeMouseUp(position: Point) {
    let path = this.path;
    setTimeout(() => {
      if (path) this.group.removeChild(path.SVG)
    }, this._timeout);
  }

  public set timeout(milliseconds: number) {
    this._timeout = milliseconds;
  }

  public set color(color: string) {
    this._color = color;
  }

  public set width(width: number) {
    this._width = width + "";
  }

  public get SVG(): SVGGElement {
    return this.group;
  }

  private start(event: MouseEvent | TouchEvent): void {
    this._container.HTML.addEventListener("mousemove", this._highlight);
    this._container.HTML.addEventListener("touchmove", this._highlight);
    document.addEventListener("mouseup", this._end);
    document.addEventListener("touchend", this._end);

    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let startPosition = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseDown(startPosition);
  }
  private highlight(event: MouseEvent | TouchEvent): void {
    let containerRect = this._container.HTML.getBoundingClientRect();
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let movePosition = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseMove(movePosition);
  }
  private end(): void {
    this.makeMouseUp({x: 0, y: 0});
    this._container.HTML.removeEventListener("mousemove", this._highlight);
    this._container.HTML.removeEventListener("touchmove", this._highlight);
    document.removeEventListener("mouseup", this._end);
    document.removeEventListener("touchend", this._end);
  }

  protected _on(): void {
    if (this._container.mouseEventSwitches.highlight) {
      this._container.HTML.addEventListener("mousedown", this._start);
      this._container.HTML.addEventListener("touchstart", this._start);
    }
    this._isOn = true;
    this._container.HTML.style.cursor = "crosshair";
    this._container.blur();

    this._container.call(Callback.HIGHLIGHT_TOOl_ON);
  }

  public off(): void {
    this._container.HTML.removeEventListener("mousedown", this._start);
    this._container.HTML.removeEventListener("touchstart", this._start);
    this._isOn = false;

    this._container.call(Callback.HIGHLIGHT_TOOl_OFF);
  }
}
