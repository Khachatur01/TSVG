import {Point} from "../../../../../../model/Point";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";
import {ClickDraw} from "../../../mode/ClickDraw";
import {RayView} from "../../../../../../element/complex/cartesian/RayView";
import {ElementView} from "../../../../../../element/ElementView";
import {SVGEvent} from "../../../../../../dataSource/constant/SVGEvent";

export class DrawRay extends ClickDraw {
  protected createDrawableElement(position: Point): RayView {
    let element = new RayView(this.drawTool.container, {overEvent: true, globalStyle: true}, {}, position, position);
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
        this.drawTool.container.__call__(SVGEvent.ELEMENT_CREATED, {element: drawableElementCopy});
      }
    }
    this.drawTool.container.tools.drawTool.__drawingEnd__();
    if (call) {
      this.drawTool.container.__call__(SVGEvent.STOP_CLICK_DRAWING);
      this.drawTool.container.__call__(SVGEvent.END_DRAWING, {drawer: this});
    }
    this._drawableElement = undefined;
    this.clicksCount = 0;
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.RAY_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.RAY_TOOL_OFF);
    }
  }

  public _new(): DrawRay {
    return new DrawRay(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.RAY;
  }
}
