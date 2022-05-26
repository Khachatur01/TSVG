import {LineView} from "../../../../../../element/shape/pointed/LineView";
import {Point} from "../../../../../../model/Point";
import {Event} from "../../../../../../dataSource/constant/Event";
import {PointedView} from "../../../../../../element/shape/pointed/PointedView";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";
import {ClickDraw} from "../../../mode/ClickDraw";

export class DrawLine extends ClickDraw {
  protected createDrawableElement(position: Point): PointedView {
    let element = new LineView(this.container, position, position);
    element.__fixRect__();
    return element;
  }
  public override makeMouseDown(position: Point, call: boolean = true) {
    super.makeMouseDown(position, call);
    if (this.clicksCount === 2) {
      this.stopDrawing(call);
    }
  }

  protected override stopClickDrawing(call: boolean = true) {
    if (!this._drawableElement) return;

    if (this.clicksCount === 1) {
      this.container.remove(this._drawableElement, true, false);
    } else {
      if (call) {
        let drawableElementCopy = this._drawableElement.copy;
        drawableElementCopy.index = this._drawableElement.index;
        this.container.__call__(Event.ELEMENT_CREATED, {element: drawableElementCopy});
      }
    }
    if (call) {
      this.container.__call__(Event.STOP_CLICK_DRAWING);
    }
    this._drawableElement = null;
    this.clicksCount = 0;
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
