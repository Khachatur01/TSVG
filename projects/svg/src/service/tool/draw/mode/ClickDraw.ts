import {Drawer} from "../Drawer";
import {Container} from "../../../../Container";
import {PointedView} from "../../../../element/shape/pointed/PointedView";
import {Point} from "../../../../model/Point";
import {Angle} from "../../../math/Angle";
import {Event} from "../../../../dataSource/constant/Event";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {ElementView} from "../../../../element/ElementView";
import {DrawTool} from "../DrawTool";

export abstract class ClickDraw extends Drawer {
  protected container: Container;
  protected _drawableElement: PointedView | null = null;

  private _click = this.click.bind(this);
  private _move = this.move.bind(this);

  public constructor(container: Container) {
    super();
    this.container = container;
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    position = this.container.grid.getSnapPoint(position);

    if (!this._drawableElement) {
      this._drawableElement = this.createDrawableElement(position);
      this.container.add(this._drawableElement);
    } else {
      this._drawableElement?.pushPoint(position);
    }
    if (call) {
      this.container.__call__(Event.DRAW_MOUSE_DOWN, {position: position, element: this._drawableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    if (!this._drawableElement) return;

    if (this.container.grid.isSnap())
      position = this.container.grid.getSnapPoint(position);
    else if (this.drawTool?.perfect) {
      let lastPoint: Point = this._drawableElement.getPoint(-2);
      position = Angle.snapLineEnd(lastPoint, position) as Point;
    }

    this._drawableElement.replacePoint(-1, position);

    if (call) {
      this.container.__call__(Event.DRAW_MOUSE_MOVE, {position: position, element: this._drawableElement});
    }
  }
  public makeMouseUp(position: Point) {}

  public abstract override _new(): ClickDraw;
  public abstract override get type(): ElementType;
  public get drawableElement(): ElementView | null {
    return this._drawableElement;
  }

  protected abstract createDrawableElement(position: Point, ownerId?: string, index?: number): PointedView;

  protected click(event: MouseEvent | TouchEvent) {
    this.container.drawTool.__drawing__();
    let containerRect = this.container?.HTML.getBoundingClientRect();

    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    this.makeMouseDown({
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    });
  }
  protected move(event: MouseEvent | TouchEvent) {
    let containerRect = this.container?.HTML.getBoundingClientRect();
    if (!containerRect) return;

    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();
    this.makeMouseMove({
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    });
  }

  public stopDrawing(call: boolean = true) {
    if (this._drawableElement && !this._drawableElement.isComplete()) {
      this.container.remove(this._drawableElement, true, false);
    }
    if (this.drawTool?.toolAfterDrawing) {
      if (this.drawTool.toolAfterDrawing instanceof DrawTool) {
        this.drawTool.toolAfterDrawing.tool = this.container.drawTools.free;
      }
      this.drawTool.toolAfterDrawing.on();
    }
    if (call) {
      this.container.__call__(Event.STOP_CLICK_DRAWING);
    }
  }

  public start(call: boolean = true): void {
    this.container.HTML.addEventListener('mousedown', this._click);
    this.container.HTML.addEventListener('touchstart', this._click);
    document.addEventListener("mousemove", this._move);
    document.addEventListener("touchmove", this._move);
  }
  public stop(call: boolean = true): void {
    this.container?.HTML.removeEventListener('mousedown', this._click);
    this.container?.HTML.removeEventListener('touchstart', this._click);
    document.removeEventListener('mousemove', this._move);
    document.removeEventListener('touchmove', this._move);
    if (!this._drawableElement || !this.container) return;

    if (this._drawableElement.isComplete()) {
      this._drawableElement.removePoint(-1);
      this.container.drawTool.__drawingEnd__();
      this._drawableElement.__refPoint__ = this._drawableElement.center;
    } else {
      this.container.remove(this._drawableElement);
    }
    if (call) {
      this.container.__call__(Event.ELEMENT_CREATED, {element: this._drawableElement});
    }

    this._drawableElement = null;
  }
}
