import {Point} from "../../../../../model/Point";
import {GraphicView} from "../../../../../element/foreign/graphic/GraphicView";
import {ElementView} from "../../../../../element/ElementView";
import {MoveDraw} from "../../mode/MoveDraw";
import {TSVG} from "../../../../../TSVG";
import {Callback} from "../../../../../dataSource/Callback";

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

  protected override onIsNotComplete() {
    if (!this.drawableElement) return;
    this.drawableElement.setSize({
      x: this.startPos.x - 150,
      y: this.startPos.y - 100,
      width: 300,
      height: 200
    }, null);
    this.drawableElement.refPoint = this.drawableElement.center;
    this.container.focus(this.drawableElement);
    this.container.selectTool.on();
  }

  public override start(container: TSVG) {
    super.start(container);
    container.call(Callback.GRAPHIC_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.GRAPHIC_TOOL_OFF);
  }

  public _new(): DrawGraphic {
    return new DrawGraphic(this.container);
  }
}
