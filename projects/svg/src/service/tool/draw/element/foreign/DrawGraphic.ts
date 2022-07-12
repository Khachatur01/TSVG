import {Point} from "../../../../../model/Point";
import {GraphicView} from "../../../../../element/foreign/graphic/GraphicView";
import {MoveDraw} from "../../mode/MoveDraw";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ElementView} from "../../../../../element/ElementView";
import {Event} from "../../../../../dataSource/constant/Event";

export class DrawGraphic extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    let graphicView = new GraphicView(this.container, {overEvent: true, globalStyle: false}, {x: position.x, y: position.y, width: 1, height: 1});
    graphicView.addFunction((x: number) => Math.pow(2, x + 1), "#486fff99");
    graphicView.addFunction((x: number) => x * x * x, "#ff6a0099");
    graphicView.addFunction((x: number) => x, "#007d1699");
    graphicView.addFunction((x: number) => Math.sin(x), "#ffd50099");
    graphicView.addFunction((x: number) => x * x, "#FF00FF99", 2.5);
    return graphicView;
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.__setRect__({
      x: this.startPosition.x - 150,
      y: this.startPosition.y - 100,
      width: 300,
      height: 200
    });
    this._drawableElement.refPoint = this._drawableElement.center;
  }
  protected override onEnd(call: boolean) {
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.GRAPHIC_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.GRAPHIC_TOOL_OFF);
    }
  }

  public _new(): DrawGraphic {
    return new DrawGraphic(this.container);
  }
  public get type(): ElementType {
    return ElementType.GRAPHIC;
  }
}
