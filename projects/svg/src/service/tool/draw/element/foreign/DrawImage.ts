import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {Event} from "../../../../../dataSource/constant/Event";
import {ImageView} from "../../../../../element/foreign/media/ImageView";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {MoveDrawable} from "../../type/MoveDrawable";

export class DrawImage extends MoveDraw {
  public src: string = "";
  protected createDrawableElement(position: Point): MoveDrawable {
    return new ImageView(this.drawTool.container, {overEvent: true, globalStyle: true}, this.src, {x: position.x, y: position.y, width: 0, height: 0});
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.__setRect__({
      x: this.startPosition.x - 150,
      y: this.startPosition.y - 100,
      width: 300,
      height: 200
    });
    this._drawableElement.refPoint = this._drawableElement?.center;
  }
  protected override onEnd(call: boolean) {
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(Event.IMAGE_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(Event.IMAGE_TOOL_OFF);
    }
  }

  public _new(): DrawImage {
    return new DrawImage(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.IMAGE;
  }
}
