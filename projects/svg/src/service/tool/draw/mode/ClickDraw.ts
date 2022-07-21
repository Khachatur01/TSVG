import {Drawer} from "../Drawer";
import {Container} from "../../../../Container";
import {Point} from "../../../../model/Point";
import {Angle} from "../../../math/Angle";
import {Event} from "../../../../dataSource/constant/Event";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {DrawTool} from "../DrawTool";
import {ClickDrawable} from "../type/ClickDrawable";
import {ElementView} from "../../../../element/ElementView";

export abstract class ClickDraw extends Drawer {
  protected container: Container;
  protected _drawableElement: ClickDrawable | undefined = undefined;
  protected clicksCount: number = 0;

  private _click = this.click.bind(this);
  private _move = this.move.bind(this);

  public constructor(container: Container) {
    super();
    this.container = container;
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    position = this.container.grid.getSnapPoint(position);
    this.clicksCount++;

    if (!this._drawableElement) {
      if (this.drawTool?.isDrawing) {
        return;
      }
      this.drawTool?.__drawing__();
      this._drawableElement = this.createDrawableElement(position);
      this.container.add(this._drawableElement as unknown as ElementView);
    } else {
      this.makeMouseMove(position, false);
      this._drawableElement.pushPoint(position);
    }

    if (call) {
      this.container.__call__(Event.DRAW_MOUSE_DOWN, {position: position, element: this._drawableElement, firstCLick: this.clicksCount === 1});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    if (!this._drawableElement) return;

    if (this.container.grid.isSnap()) {
      position = this.container.grid.getSnapPoint(position);
    } else if (this.drawTool?.perfect) {
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
  public get drawableElement(): ClickDrawable | undefined {
    return this._drawableElement;
  }

  protected abstract createDrawableElement(position: Point, ownerId?: string, index?: number): ClickDrawable;

  protected click(event: MouseEvent | TouchEvent) {
    let containerRect = this.container?.HTML.getBoundingClientRect();

    let eventPosition = Container.__eventToPosition__(event);
    event.preventDefault();

    let position = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    }
    this.makeMouseDown(position);
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

  protected stopClickDrawing(call: boolean = true) {
    if (!this._drawableElement || !this.drawTool?.isDrawing) return;

    if (!this._drawableElement.isComplete()) {
      this.container.remove(this._drawableElement as unknown as ElementView, true, true);
    } else {
      this._drawableElement.removePoint(-1);
      this._drawableElement.refPoint = this._drawableElement.center;

      if (call) {
        let drawableElementCopy = this._drawableElement.copy;
        drawableElementCopy.index = this._drawableElement.index;
        this.container.__call__(Event.ELEMENT_CREATED, {element: drawableElementCopy});
      }
    }

    this._drawableElement = undefined;
    this.clicksCount = 0;
    this.drawTool?.__drawingEnd__();

    if (call) {
      this.container.__call__(Event.STOP_CLICK_DRAWING);
    }
  }

  public stopDrawing(call: boolean = true) {
    this.stopClickDrawing(call);
    if (this.drawTool?.toolAfterDrawing) {
      if (this.drawTool.toolAfterDrawing instanceof DrawTool) {
        this.drawTool.toolAfterDrawing.drawer = this.container.drawers.free;
      }
      this.drawTool.toolAfterDrawing.on();
    }
  }

  public start(call: boolean = true): void {
    this.container.HTML.addEventListener('mousedown', this._click);
    this.container.HTML.addEventListener('touchstart', this._click);
    this.container.HTML.addEventListener("mousemove", this._move);
    /* this.container.HTML.addEventListener("touchmove", this._move); */
  }
  public stop(call: boolean = true): void {
    this.container.HTML.removeEventListener('mousedown', this._click);
    this.container.HTML.removeEventListener('touchstart', this._click);
    this.container.HTML.removeEventListener('mousemove', this._move);
    /* this.container.HTML.removeEventListener('touchmove', this._move); */
    this.stopClickDrawing(call);
  }
}
