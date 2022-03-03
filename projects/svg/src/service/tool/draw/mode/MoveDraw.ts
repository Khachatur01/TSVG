import {Drawable} from "../Drawable";
import {ElementView} from "../../../../element/ElementView";
import {TSVG} from "../../../../TSVG";
import {Point} from "../../../../model/Point";
import {MoveDrawable} from "../type/MoveDrawable";
import {Callback} from "../../../../dataSource/Callback";

export abstract class MoveDraw implements Drawable {
  protected container: TSVG;
  protected startPos: Point = {x: 0, y: 0}

  private _drawStart = this.drawStart.bind(this);
  private _draw = this.draw.bind(this);
  private _drawEnd = this.drawEnd.bind(this);

  protected drawableElement: ElementView | null = null;

  public constructor(container: TSVG) {
    this.container = container;
  }

  public makeMouseDown(position: Point) {
    this.startPos.x = position.x; //x position within the element.
    this.startPos.y = position.y; //y position within the element.

    this.startPos = this.container.grid.getSnapPoint(this.startPos);

    this.drawableElement = this.createDrawableElement(this.startPos);
    this.container.add(this.drawableElement);
    this.container.drawTool.drawing();
    this.container.call(Callback.DRAW_CLICK, {position: this.startPos});
  }
  public makeMouseMove(position: Point) {
    let width = position.x - this.startPos.x;
    let height = position.y - this.startPos.y;

    if (this.container.perfect) {
      let averageSize = (Math.abs(width) + Math.abs(height)) / 2
      if (width < 0)
        width = -averageSize;
      else
        width = averageSize;
      if (height < 0)
        height = -averageSize;
      else
        height = averageSize;
    }

    if (this.container.grid.isSnap()) {
      let snapPoint = this.container.grid.getSnapPoint({
        x: this.startPos.x + width,
        y: this.startPos.y + height
      });
      width = snapPoint.x - this.startPos.x;
      height = snapPoint.y - this.startPos.y;
    }

    /* if xElement instance of MoveDrawable, set drawSize */
    (this.drawableElement as unknown as MoveDrawable)?.drawSize({
      x: this.startPos.x,
      y: this.startPos.y,
      width: width,
      height: height
    });
    this.container.call(Callback.DRAW_MOVE, {position: position});
  }
  public makeMouseUp(position: Point) {
    if (!this.drawableElement) return;

    /* if element isn't drawn */
    if (this.drawableElement.isComplete()) {
      this.container.blur();

      this.drawableElement.refPoint = this.drawableElement.center;
      this.container.focused.lastRefPoint = this.drawableElement.refPoint;

      this.container.focus(this.drawableElement);
      this.container.focused.fixRect();
      this.container.selectTool.on();
    } else {
      this.onIsNotComplete();
    }

    this.onEnd();
    this.container.drawTool.drawingEnd();
    this.drawableElement = null;
    this.container.call(Callback.DRAW_END);
  }

  public abstract _new(): MoveDraw;
  protected abstract createDrawableElement(position: Point): ElementView;

  protected drawStart(event: MouseEvent | TouchEvent) {
    this.container.HTML.addEventListener('mousemove', this._draw);
    this.container.HTML.addEventListener('touchmove', this._draw);
    document.addEventListener('mouseup', this._drawEnd);
    document.addEventListener('touchend', this._drawEnd);
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let containerRect = this.container.HTML.getBoundingClientRect();

    this.makeMouseDown({
      x: eventPosition.x - containerRect.left, //x position within the element.
      y: eventPosition.y - containerRect.top  //y position within the element.
    });
  }
  protected draw(event: MouseEvent | TouchEvent) {
    if (!this.drawableElement) return;
    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let containerRect = this.container.HTML.getBoundingClientRect();

    this.makeMouseMove({
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    });
  }
  protected drawEnd() {
    this.container.HTML.removeEventListener('mousemove', this._draw);
    this.container.HTML.removeEventListener('touchmove', this._draw);
    document.removeEventListener('mouseup', this._drawEnd);
    document.removeEventListener('touchend', this._drawEnd);
    this.makeMouseUp({x: 0, y: 0});
  }

  protected onEnd() {}
  protected onIsNotComplete() {
    if (this.drawableElement)
      this.container.remove(this.drawableElement);
  }

  public start(container: TSVG): void {
    this.container = container;
    if (container.mouseEventSwitches.draw) {
      this.container.HTML.addEventListener('mousedown', this._drawStart);
      this.container.HTML.addEventListener('touchstart', this._drawStart);
    }
  }
  public stop(): void {
    this.container.HTML.removeEventListener('mousedown', this._drawStart);
    this.container.HTML.removeEventListener('touchstart', this._drawStart);
  }
}
