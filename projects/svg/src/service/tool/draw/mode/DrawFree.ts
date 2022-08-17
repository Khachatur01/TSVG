import {Drawer} from "../Drawer";
import {FreeView} from "../../../../element/shape/path/FreeView";
import {Container} from "../../../../Container";
import {Point} from "../../../../model/Point";
import {Angle} from "../../../math/Angle";
import {Path} from "../../../../model/path/Path";
import {MoveTo} from "../../../../model/path/point/MoveTo";
import {Event} from "../../../../dataSource/constant/Event";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {ElementView} from "../../../../element/ElementView";
import {Cursor} from "../../../../dataSource/constant/Cursor";
import {DrawTool} from "../DrawTool";

export class DrawFree extends Drawer {
  private _drawableElement: FreeView | undefined = undefined;
  public snappable: boolean = false;

  private _drawStart = this.drawStart.bind(this);
  private _draw = this.draw.bind(this);
  private _drawEnd = this.drawEnd.bind(this);

  public constructor(drawTool: DrawTool) {
    super(drawTool);
    this.cursor = Cursor.DRAW_FREE;
  }

  public makeMouseDown(position: Point, call: boolean = true) {
    if (this.drawTool.isDrawing) {
      return;
    }
    if (this.snappable) {
      position = this.drawTool.container.grid.getSnapPoint(position);
    }

    let pathObject = new Path();
    pathObject.add(new MoveTo(position));
    this._drawableElement = new FreeView(this.drawTool.container, {overEvent: true, globalStyle: true}, pathObject);
    this.drawTool.__drawing__();

    this.drawTool.container.add(this._drawableElement);

    if (call) {
      this.drawTool.container.__call__(Event.DRAW_MOUSE_DOWN, {position: position, element: this._drawableElement});
    }
  }
  public makeMouseMove(position: Point, call: boolean = true, additional?: any) {
    if (!this._drawableElement) return;

    if (additional) {
      this._drawableElement.setAttr({
        d: additional.path
      });
    } else {
      if (this.snappable && this.drawTool.container.grid.isSnap()) {
        position = this.drawTool.container.grid.getSnapPoint(position);
        this._drawableElement.pushPoint(position);
      } else if (this.drawTool.perfect) {
        try {
          let lastPoint: Point = this._drawableElement.getPoint(-1);
          position = Angle.snapLineEnd(lastPoint, position) as Point;
          this._drawableElement.replacePoint(-1, position);
        } catch (typeError) {
          /* lastPoint may be undefined */
        }
      } else {
        this._drawableElement.pushPoint(position);
      }
    }

    if (call) {
      this.drawTool.container.__call__(Event.DRAW_MOUSE_MOVE, {position: position, element: this._drawableElement});
    }
  }
  public makeMouseUp(position: Point, call: boolean = true, additional?: any) {
    if (!this._drawableElement) return;

    if (additional) {
      this._drawableElement.pathString = additional.path;
    }
    if (!this._drawableElement.isComplete()) {
      this.drawTool.container.remove(this._drawableElement, true, false);
    } else {
      this._drawableElement.refPoint = this._drawableElement.center;
    }
    this.drawTool.__drawing__();

    if (call) {
      this.drawTool.container.__call__(Event.DRAW_MOUSE_UP, {position: position, element: this._drawableElement});
      this.drawTool.container.__call__(Event.ELEMENT_CREATED, {position: position, element: this._drawableElement});
    }
  }

  public _new(): DrawFree {
    return new DrawFree(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.FREE;
  }
  public get drawableElement(): ElementView | undefined {
    return this._drawableElement;
  }

  private drawStart(event: MouseEvent | TouchEvent) {
    document.addEventListener('mousemove', this._draw);
    document.addEventListener('touchmove', this._draw);
    document.addEventListener('mouseup', this._drawEnd);
    document.addEventListener('touchend', this._drawEnd);

    let containerRect = this.drawTool.container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    this.drawTool.__mouseCurrentPos__ = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseDown(this.drawTool.mouseCurrentPos);
  }
  private draw(event: MouseEvent | TouchEvent): void {
    let containerRect = this.drawTool.container.HTML.getBoundingClientRect();
    let eventPosition = Container.__eventToPosition__(event);
    this.drawTool.__mouseCurrentPos__ = {
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    };
    this.makeMouseMove(this.drawTool.mouseCurrentPos);
  }
  private drawEnd() {
    this.stopDrawing();
  }

  public override stopDrawing(call?: boolean) {
    document.removeEventListener('mousemove', this._draw);
    document.removeEventListener('touchmove', this._draw);
    document.removeEventListener('mouseup', this._drawEnd);
    document.removeEventListener('touchend', this._drawEnd);

    if (this.drawTool.isDrawing) {
      this.makeMouseUp(this.drawTool.mouseCurrentPos, call);
    }
    this.drawTool.container.tools.drawTool.__drawingEnd__();
  }

  public start(call: boolean = true): void {
    this.drawTool.container.HTML.addEventListener('mousedown', this._drawStart);
    this.drawTool.container.HTML.addEventListener('touchstart', this._drawStart);

    if (call) {
      this.drawTool.container.__call__(Event.FREE_HAND_TOOL_ON);
    }
  }
  public stop(call: boolean = true): void {
    this.drawTool.container.HTML.removeEventListener('mousedown', this._drawStart);
    this.drawTool.container.HTML.removeEventListener('touchstart', this._drawStart);

    if (call) {
      this.drawTool.container.__call__(Event.FREE_HAND_TOOL_OFF);
    }
  }
}
