import {Drawer} from "../Drawer";
import {ElementView} from "../../../../element/ElementView";
import {Container} from "../../../../Container";
import {Point} from "../../../../model/Point";
import {MoveDrawable} from "../type/MoveDrawable";
import {Event} from "../../../../dataSource/constant/Event";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {DrawTool} from "../DrawTool";

export abstract class MoveDraw extends Drawer {
  protected startPosition: Point = {x: 0, y: 0};
  protected _drawableElement: MoveDrawable | undefined = undefined;

  public constructor(drawTool: DrawTool) {
    super(drawTool);

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  protected mouseDownEvent(event: MouseEvent | TouchEvent) {
    document.addEventListener('mousemove', this.mouseMoveEvent);
    document.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);

    let containerRect = this.drawTool.container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    this.drawTool.__mouseCurrentPos__ = {
      x: eventPosition.x - containerRect.left, //x position within the element.
      y: eventPosition.y - containerRect.top  //y position within the element.
    };

    this.makeMouseDown(this.drawTool.mouseCurrentPos);
  };
  protected mouseMoveEvent (event: MouseEvent | TouchEvent) {
    if (!this._drawableElement) return;
    let containerRect = this.drawTool.container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    this.drawTool.__mouseCurrentPos__ = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseMove(this.drawTool.mouseCurrentPos);
  };
  protected mouseUpEvent() {
    this.stopDrawing();
  };

  public makeMouseDown(position: Point, call: boolean = true) {
    if (this.drawTool.isDrawing) {
      return;
    }
    this.startPosition.x = position.x; //x position within the element.
    this.startPosition.y = position.y; //y position within the element.

    this.startPosition = this.drawTool.container.grid.getSnapPoint(this.startPosition);

    this._drawableElement = this.createDrawableElement(this.startPosition);

    this.drawTool.container.add(this._drawableElement as unknown as ElementView);
    this.drawTool.__drawing__();
    if (call) {
      this.drawTool.container.__call__(Event.DRAW_MOUSE_DOWN, {position: this.startPosition, element: this._drawableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true) {
    let width = position.x - this.startPosition.x;
    let height = position.y - this.startPosition.y;

    if (this.drawTool.perfect) {
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

    if (this.drawTool.container.grid.isSnap()) {
      let snapPoint = this.drawTool.container.grid.getSnapPoint({
        x: this.startPosition.x + width,
        y: this.startPosition.y + height
      });
      width = snapPoint.x - this.startPosition.x;
      height = snapPoint.y - this.startPosition.y;
    }

    /* if _drawableElement instance of MoveDrawable, set drawSize */ /* todo change drawable element type from ElementView to MoveDrawable */
    (this._drawableElement as unknown as MoveDrawable).__drawSize__({
      x: this.startPosition.x,
      y: this.startPosition.y,
      width: width,
      height: height
    });

    if (call) {
      this.drawTool.container.__call__(Event.DRAW_MOUSE_MOVE, {position: position, element: this._drawableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true) {
    if (!this._drawableElement) return;

    this.makeMouseMove(position, false);

    /* if element is drawn */
    if (!this._drawableElement.isComplete()) {
      this.onIsNotComplete(call);
    }
    this.onEnd(call);

    this._drawableElement.refPoint = this._drawableElement.center;

    this.drawTool.__drawingEnd__();

    if (call) {
      this.drawTool.container.__call__(Event.DRAW_MOUSE_UP, {position: position, element: this._drawableElement});
      this.drawTool.container.__call__(Event.ELEMENT_CREATED, {element: this._drawableElement});
      this.drawTool.container.__call__(Event.END_DRAWING, {drawer: this});
    }
  }

  public abstract override _new(): MoveDraw;
  public abstract override get type(): ElementType;
  public get drawableElement(): MoveDrawable | undefined {
    return this._drawableElement;
  }

  protected abstract createDrawableElement(position: Point): MoveDrawable;

  protected onEnd(call: boolean) {}
  protected onIsNotComplete(call: boolean) {
    if (this._drawableElement)
      this.drawTool.container.remove(this._drawableElement as unknown as ElementView, true, false);
  }

  public override stopDrawing(call?: boolean) {
    this.drawTool.container.tools.drawTool.__drawingEnd__();

    document.removeEventListener('mousemove', this.mouseMoveEvent);
    document.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);

    this.makeMouseUp(this.drawTool.mouseCurrentPos, call);
  }

  public start(call: boolean = true): void {
    this.drawTool.container.HTML.addEventListener('mousedown', this.mouseDownEvent);
    this.drawTool.container.HTML.addEventListener('touchstart', this.mouseDownEvent);
  }
  public stop(call: boolean = true): void {
    this.drawTool.container.HTML.removeEventListener('mousedown', this.mouseDownEvent);
    this.drawTool.container.HTML.removeEventListener('touchstart', this.mouseDownEvent);
  }
}
