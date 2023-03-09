import {Drawer} from '../Drawer';
import {Container} from '../../../../Container';
import {Point} from '../../../../model/Point';
import {Angle} from '../../../math/Angle';
import {SVGEvent} from '../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../dataSource/constant/ElementType';
import {DrawTool} from '../DrawTool';
import {ClickDrawable} from '../type/ClickDrawable';
import {ElementView} from '../../../../element/ElementView';
import {Drawable} from '../type/Drawable';

export abstract class ClickDrawer extends Drawer {
  protected _drawableElement: ClickDrawable | undefined = undefined;
  protected clicksCount: number = 0;

  public constructor(drawTool: DrawTool) {
    super(drawTool);

    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
  }

  public makeMouseDown(position: Point, call: boolean = true, parameter?: any): void {
    position = this.drawTool.container.grid.getSnapPoint(position);
    this.clicksCount++;

    if (!this._drawableElement) {
      if (this.drawTool.isDrawing) {
        return;
      }
      this.drawTool.__drawing__();
      this._drawableElement = this.createDrawableElement(position);
      this.drawTool.container.add(this._drawableElement as unknown as ElementView);
    } else {
      this.makeMouseMove(position, false);
      this._drawableElement.pushPoint(position);
    }

    if (call) {
      this.drawTool.container.__call__(SVGEvent.DRAW_MOUSE_DOWN, {position, element: this._drawableElement, firstCLick: this.clicksCount === 1});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true, parameter?: any): void {
    if (!this._drawableElement) {return;}

    if (this.drawTool.container.grid.isSnapOn()) {
      position = this.drawTool.container.grid.getSnapPoint(position);
    } else if (this.drawTool.perfect) {
      const lastPoint: Point = this._drawableElement.getPoint(-2);
      position = Angle.snapLineEnd(lastPoint, position) as Point;
    }

    this._drawableElement.replacePoint(-1, position);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.DRAW_MOUSE_MOVE, {position, element: this._drawableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true, parameter?: any): void {}

  /* mouseDownEvent method defined in parent class */
  protected mouseMoveEvent(event: MouseEvent | TouchEvent): void {
    const containerRect: DOMRect = this.drawTool.container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this.drawTool.__mouseCurrentPos__ = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseMove(this.drawTool.mouseCurrentPos);
  };
  protected mouseUpEvent(event: MouseEvent | TouchEvent): void {
    const containerRect: DOMRect = this.drawTool.container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this.drawTool.__mouseCurrentPos__ = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseUp(this.drawTool.mouseCurrentPos);
  };

  public abstract override _new(): ClickDrawer;
  public abstract override get type(): ElementType;
  public get drawableElement(): ClickDrawable | undefined {
    return this._drawableElement;
  }

  protected abstract createDrawableElement(position: Point, ownerId?: string, index?: number): ClickDrawable;

  protected stopClickDrawing(call: boolean = true): void {
    if (!this._drawableElement || !this.drawTool.isDrawing) {return;}

    if (!this._drawableElement.isComplete()) {
      this.drawTool.container.remove(this._drawableElement as unknown as ElementView, true, true);
    } else {
      this._drawableElement.removePoint(-1);
      this._drawableElement.refPoint = this._drawableElement.center;

      if (call) {
        const drawableElementCopy: Drawable = this._drawableElement.copy;
        drawableElementCopy.index = this._drawableElement.index;
        this.drawTool.container.__call__(SVGEvent.ELEMENT_CREATED, {element: drawableElementCopy});
      }
    }

    this._drawableElement = undefined;
    this.clicksCount = 0;
    this.drawTool.__drawingEnd__();

    if (call) {
      this.drawTool.container.__call__(SVGEvent.STOP_CLICK_DRAWING);
      this.drawTool.container.__call__(SVGEvent.END_DRAWING, {drawer: this});
    }
  }

  public stopDrawing(call: boolean = true): void {
    this.stopClickDrawing(call);
  }

  public start(call: boolean = true): void {
    this.drawTool.container.HTML.addEventListener('mousedown', this.mouseDownEvent);
    this.drawTool.container.HTML.addEventListener('touchstart', this.mouseDownEvent);
  }
  public stop(call: boolean = true): void {
    this.drawTool.container.HTML.removeEventListener('mousedown', this.mouseDownEvent);
    this.drawTool.container.HTML.removeEventListener('touchstart', this.mouseDownEvent);
    document.removeEventListener('mousemove', this.mouseMoveEvent);
    /* this.container.HTML.removeEventListener('touchmove', this._move); */
    this.stopClickDrawing(call);
  }
}
