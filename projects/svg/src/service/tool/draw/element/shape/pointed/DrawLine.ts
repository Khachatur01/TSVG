import {LineView} from "../../../../../../element/shape/pointed/LineView";
import {Point} from "../../../../../../model/Point";
import {Event} from "../../../../../../dataSource/constant/Event";
import {PointedView} from "../../../../../../element/shape/pointed/PointedView";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";
import {ClickDraw} from "../../../mode/ClickDraw";
import {DrawTool} from "../../../DrawTool";

export class DrawLine extends ClickDraw {
  private clicksCount: number = 0;
  protected createDrawableElement(position: Point): PointedView {
    let element = new LineView(this.container, position, position);
    element.__fixRect__();
    return element;
  }
  public override makeMouseDown(position: Point, call: boolean = true) {
    this.clicksCount++;
    if (this.clicksCount === 2) {
      this.stopDrawing(call);
      this.clicksCount = 0;
    } else {
      super.makeMouseDown(position, call);
    }
  }

  public override stopDrawing(call: boolean = true) {
    if (this.clicksCount !== 2 && this._drawableElement) {
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

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.LINE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.LINE_TOOL_OFF);
    }
  }

  public _new(): DrawLine {
    return new DrawLine(this.container);
  }
  public get type(): ElementType {
    return ElementType.LINE;
  }
}
