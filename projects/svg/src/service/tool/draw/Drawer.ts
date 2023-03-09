import {Point} from '../../../model/Point';
import {ElementType} from '../../../dataSource/constant/ElementType';
import {DrawTool} from './DrawTool';
import {Cursor} from '../../../dataSource/constant/Cursor';
import {Drawable} from './type/Drawable';
import {Container} from '../../../Container';

export abstract class Drawer {
  public drawTool: DrawTool;
  public cursor: Cursor = Cursor.DRAW;

  protected constructor(drawTool: DrawTool) {
    this.drawTool = drawTool;
  }

  public abstract makeMouseDown(position: Point, call?: boolean, parameter?: any): void;
  public abstract makeMouseMove(position: Point, call?: boolean, parameter?: any): void;
  public abstract makeMouseUp(position: Point, call?: boolean, parameter?: any): void;

  protected mouseDownEvent(event: MouseEvent | TouchEvent): void {
    document.addEventListener('mousemove', this.mouseMoveEvent);
    document.addEventListener('touchmove', this.mouseMoveEvent);
    document.addEventListener('mouseup', this.mouseUpEvent);
    document.addEventListener('touchend', this.mouseUpEvent);

    const containerRect: DOMRect = this.drawTool.container.HTML.getBoundingClientRect();
    const eventPosition: Point = Container.__eventToPosition__(event);
    this.drawTool.__mouseCurrentPos__ = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };

    this.makeMouseDown(this.drawTool.mouseCurrentPos);
  };
  protected abstract mouseMoveEvent(event: MouseEvent | TouchEvent): void;
  protected abstract mouseUpEvent(event: MouseEvent | TouchEvent): void;

  public abstract _new(): Drawer;
  public abstract get type(): ElementType;
  public abstract get drawableElement(): Drawable | undefined;

  public abstract stopDrawing(call?: boolean): void;

  public abstract start(call?: boolean): void;
  public abstract stop(call?: boolean): void;
}
