import {Drawer} from "../Drawer";
import {ElementView} from "../../../../element/ElementView";
import {Container} from "../../../../Container";
import {Point} from "../../../../model/Point";
import {MoveDrawable} from "../type/MoveDrawable";
import {Event} from "../../../../dataSource/constant/Event";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {DrawTool} from "../DrawTool";

export abstract class MoveDraw extends Drawer {
  protected container: Container;
  protected startPosition: Point = {x: 0, y: 0};
  protected currentPosition: Point = {x: 0, y: 0};

  protected _drawStart = this.drawStart.bind(this);
  protected _draw = this.draw.bind(this);
  protected _drawEnd = this.drawEnd.bind(this);

  protected _drawableElement: ElementView | null = null;

  public constructor(container: Container) {
    super();
    this.container = container;
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    if (this.drawTool?.isDrawing) {
      return;
    }
    this.startPosition.x = position.x; //x position within the element.
    this.startPosition.y = position.y; //y position within the element.

    this.startPosition = this.container.grid.getSnapPoint(this.startPosition);
    this.currentPosition = Object.assign({}, this.startPosition);

    this._drawableElement = this.createDrawableElement(this.startPosition);

    this.container.add(this._drawableElement);
    this.drawTool?.__drawing__();
    if (call) {
      this.container.__call__(Event.DRAW_MOUSE_DOWN, {position: this.startPosition, element: this._drawableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    let width = position.x - this.startPosition.x;
    let height = position.y - this.startPosition.y;
    this.currentPosition = Object.assign({}, position);

    if (this.drawTool?.perfect) {
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
        x: this.startPosition.x + width,
        y: this.startPosition.y + height
      });
      width = snapPoint.x - this.startPosition.x;
      height = snapPoint.y - this.startPosition.y;
    }

    /* if _drawableElement instance of MoveDrawable, set drawSize */
    (this._drawableElement as unknown as MoveDrawable)?.__drawSize__({
      x: this.startPosition.x,
      y: this.startPosition.y,
      width: width,
      height: height
    });

    if (call) {
      this.container.__call__(Event.DRAW_MOUSE_MOVE, {position: position, element: this._drawableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    if (!this._drawableElement) return;

    this.makeMouseMove(position, false);

    /* if element is drawn */
    if (!this._drawableElement.isComplete()) {
      this.onIsNotComplete(call);
    }

    this._drawableElement.refPoint = this._drawableElement.center;

    this.turnOnToolAfterDrawing();

    this.onEnd(call);
    this.drawTool?.__drawingEnd__();

    if (call) {
      this.container.__call__(Event.DRAW_MOUSE_UP, {position: position, element: this._drawableElement});
      this.container.__call__(Event.ELEMENT_CREATED, {element: this._drawableElement});
    }
  }

  public abstract override _new(): MoveDraw;
  public abstract override get type(): ElementType;
  public get drawableElement(): ElementView | null {
    return this._drawableElement;
  }

  protected abstract createDrawableElement(position: Point): ElementView;
  protected turnOnToolAfterDrawing(): void {
    if (this.drawTool?.toolAfterDrawing) {
      if (this.drawTool.toolAfterDrawing instanceof DrawTool) {
        this.drawTool.toolAfterDrawing.drawer = this.container.drawers.free;
      }
      this.drawTool.toolAfterDrawing.on();
    }
  }

  protected drawStart(event: MouseEvent | TouchEvent) {
    this.container.HTML.addEventListener('mousemove', this._draw);
    this.container.HTML.addEventListener('touchmove', this._draw);
    document.addEventListener('mouseup', this._drawEnd);
    document.addEventListener('touchend', this._drawEnd);
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    let containerRect = this.container.HTML.getBoundingClientRect();

    this.makeMouseDown({
      x: eventPosition.x - containerRect.left, //x position within the element.
      y: eventPosition.y - containerRect.top  //y position within the element.
    });
  }
  protected draw(event: MouseEvent | TouchEvent) {
    if (!this._drawableElement) return;
    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    let containerRect = this.container.HTML.getBoundingClientRect();

    this.makeMouseMove({
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    });
  }
  protected drawEnd(event: MouseEvent | TouchEvent) {
    this.stopDrawing();
  }

  protected onEnd(call: boolean) {}
  protected onIsNotComplete(call: boolean) {
    if (this._drawableElement)
      this.container.remove(this._drawableElement, true, false);
  }

  public override stopDrawing(call?: boolean) {
    this.container.tools.drawTool.__drawingEnd__();

    this.container.HTML.removeEventListener('mousemove', this._draw);
    this.container.HTML.removeEventListener('touchmove', this._draw);
    document.removeEventListener('mouseup', this._drawEnd);
    document.removeEventListener('touchend', this._drawEnd);

    this.makeMouseUp(this.currentPosition, call);
  }

  public start(call: boolean = true): void {
    this.container.HTML.addEventListener('mousedown', this._drawStart);
    this.container.HTML.addEventListener('touchstart', this._drawStart);
  }
  public stop(call: boolean = true): void {
    this.container.HTML.removeEventListener('mousedown', this._drawStart);
    this.container.HTML.removeEventListener('touchstart', this._drawStart);
  }
}
