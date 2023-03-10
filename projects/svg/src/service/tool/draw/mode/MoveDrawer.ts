import {ElementView} from '../../../../element/ElementView';
import {Container} from '../../../../Container';
import {Point} from '../../../../model/Point';
import {MoveDrawable} from '../type/MoveDrawable';
import {SVGEvent} from '../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../dataSource/constant/ElementType';
import {DrawTool} from '../DrawTool';
import {Drawer} from '../Drawer';
import {Rect} from '../../../../model/Rect';

export abstract class MoveDrawer extends Drawer {
  protected _drawableElement: MoveDrawable | undefined = undefined;
  protected startPosition: Point = {x: 0, y: 0};

  public constructor(drawTool: DrawTool) {
    super(drawTool);

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  public makeMouseDown(position: Point, call: boolean = true, parameter?: any): void {
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
      this.drawTool.container.__call__(SVGEvent.DRAW_MOUSE_DOWN, {position: this.startPosition, element: this._drawableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true, parameter?: any): void {
    let rect: Rect = {
      x: position.x,
      y: position.y,
      width: position.x - this.startPosition.x,
      height: position.y - this.startPosition.y
    };

    if (this.drawTool.perfect) {
      rect = ElementView.rectToSquare(rect);
    }

    if (this.drawTool.container.grid.isSnapOn()) {
      const snapPoint: Point = this.drawTool.container.grid.getSnapPoint({
        x: this.startPosition.x + rect.width,
        y: this.startPosition.y + rect.height
      });
      rect.width = snapPoint.x - this.startPosition.x;
      rect.height = snapPoint.y - this.startPosition.y;
    }

    /* if _drawableElement instance of MoveDrawable, set drawSize */ /* TODO - change drawable element type from ElementView to MoveDrawable */
    (this._drawableElement as unknown as MoveDrawable).__drawSize__({
      x: this.startPosition.x,
      y: this.startPosition.y,
      width: rect.width,
      height: rect.height
    });

    if (call) {
      this.drawTool.container.__call__(SVGEvent.DRAW_MOUSE_MOVE, {position, element: this._drawableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true, parameter?: any): void {
    if (!this._drawableElement) {
      return;
    }

    this.makeMouseMove(position, false);

    /* if element is drawn */
    if (!this._drawableElement.isComplete()) {
      this.onIsNotComplete(call);
    }
    this.onEnd(call);

    this._drawableElement.refPoint = this._drawableElement.center;

    this.drawTool.__drawingEnd__();

    if (call) {
      this.drawTool.container.__call__(SVGEvent.DRAW_MOUSE_UP, {position, element: this._drawableElement});
      this.drawTool.container.__call__(SVGEvent.ELEMENT_CREATED, {element: this._drawableElement});
      this.drawTool.container.__call__(SVGEvent.END_DRAWING, {drawer: this});
    }
  }

  /* mouseDownEvent method defined in parent class */
  protected mouseMoveEvent(event: MouseEvent | TouchEvent): void {
    if (!this._drawableElement) {
      return;
    }
    const containerRect: DOMRect = this.drawTool.container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this.drawTool.__mouseCurrentPos__ = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseMove(this.drawTool.mouseCurrentPos);
  };
  protected mouseUpEvent(event: MouseEvent | TouchEvent): void {
    this.stopDrawing();
  };

  public abstract override _new(): MoveDrawer;
  public abstract override get type(): ElementType;
  public get drawableElement(): MoveDrawable | undefined {
    return this._drawableElement;
  }

  public override stopDrawing(call?: boolean): void {
    this.drawTool.container.tools.drawTool.__drawingEnd__();

    document.removeEventListener('mousemove', this.mouseMoveEvent);
    document.removeEventListener('touchmove', this.mouseMoveEvent);
    document.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('touchend', this.mouseUpEvent);

    this.makeMouseUp(this.drawTool.mouseCurrentPos, call);
  }

  protected abstract createDrawableElement(position: Point): MoveDrawable;

  protected onEnd(call: boolean): void {}
  protected onIsNotComplete(call: boolean): void {
    if (this._drawableElement) {
      this.drawTool.container.remove(this._drawableElement as unknown as ElementView, true, false);
    }
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
