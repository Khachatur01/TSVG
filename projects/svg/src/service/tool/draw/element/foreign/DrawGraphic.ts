import {Point} from "../../../../../model/Point";
import {GraphicView} from "../../../../../element/foreign/graphic/GraphicView";
import {ElementView} from "../../../../../element/ElementView";
import {MoveDraw} from "../../mode/MoveDraw";
import {Callback} from "../../../../../dataSource/constant/Callback";
import {ElementType} from "../../../../../dataSource/constant/ElementType";

export class DrawGraphic extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    let graphicView = new GraphicView(this.container, position);
    // graphicView.addFunction((x: number) => Math.sin(Math.pow(Math.E, x)), "#ff7f3f");
    graphicView.addFunction((x: number) => Math.pow(2, x + 1), "#486fff");
    graphicView.addFunction((x: number) => x * x * x, "#b700ff");
    graphicView.addFunction((x: number) => x, "#007d16");
    graphicView.addFunction((x: number) => Math.sin(x), "#ff7f3f");
    graphicView.addFunction((x: number) => x * x, "#000", 2.5);
    return graphicView;
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.setSize({
      x: this.startPos.x - 150,
      y: this.startPos.y - 100,
      width: 300,
      height: 200
    }, null);
    this._drawableElement.refPoint = this._drawableElement.center;
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.call(Callback.GRAPHIC_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.GRAPHIC_TOOL_OFF);
    }
  }

  public _new(): DrawGraphic {
    return new DrawGraphic(this.container);
  }
  public get type(): ElementType {
    return ElementType.GRAPHIC;
  }
}
