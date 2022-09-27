import {LineView} from "../../../../../../element/shape/pointed/LineView";
import {Point} from "../../../../../../model/Point";
import {Event} from "../../../../../../dataSource/constant/Event";
import {PointedView} from "../../../../../../element/shape/pointed/PointedView";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";
import {ClickDraw} from "../../../mode/ClickDraw";
import {ElementView} from "../../../../../../element/ElementView";

export class DrawLine extends ClickDraw {
  protected createDrawableElement(position: Point): PointedView {
    let element = new LineView(this.drawTool.container, {overEvent: true, globalStyle: true}, position, position);
    element.__fixRect__();
    return element;
  }
  public override makeMouseDown(position: Point, call: boolean = true) {
    super.makeMouseDown(position, call);
    if (this.clicksCount === 2) {
      this.stopDrawing();
    }
  }

  protected override stopClickDrawing(call: boolean = true) {
    if (!this._drawableElement) return;

    if (this.clicksCount === 1) {
      this.drawTool.container.remove(this._drawableElement as unknown as ElementView, true, false);
    } else {
      this._drawableElement.refPoint = this._drawableElement.center;
      if (call) {
        let drawableElementCopy = this._drawableElement.copy;
        drawableElementCopy.index = this._drawableElement.index;
        this.drawTool.container.__call__(Event.ELEMENT_CREATED, {element: drawableElementCopy});
      }
    }
    this.drawTool.container.tools.drawTool.__drawingEnd__();
    this._drawableElement = undefined;
    this.clicksCount = 0;
    if (call) {
      this.drawTool.container.__call__(Event.STOP_CLICK_DRAWING);
      this.drawTool.container.__call__(Event.END_DRAWING, {drawer: this});
    }
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(Event.LINE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(Event.LINE_TOOL_OFF);
    }
  }

  public _new(): DrawLine {
    return new DrawLine(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.LINE;
  }
}
