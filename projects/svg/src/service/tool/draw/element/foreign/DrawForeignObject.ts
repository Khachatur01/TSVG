import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ForeignObjectView} from "../../../../../element/foreign/ForeignObjectView";
import {Event} from "../../../../../dataSource/constant/Event";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {MoveDrawable} from "../../type/MoveDrawable";

export class DrawForeignObject extends MoveDraw {
  public content: string = "";

  protected createDrawableElement(position: Point): MoveDrawable {
    let videoView = new ForeignObjectView(this.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 0, height: 0});
    videoView.setContent(this.content);
    return videoView;
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.__setRect__({
      x: this.startPosition.x,
      y: this.startPosition.y,
      width: 600,
      height: 200
    });
    this._drawableElement.refPoint = this._drawableElement?.center;
  }
  protected override onEnd(call: boolean) {

  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.ASSET_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.ASSET_TOOL_OFF);
    }
  }

  public _new(): DrawForeignObject {
    return new DrawForeignObject(this.container);
  }
  public get type(): ElementType {
    return ElementType.FOREIGN_OBJECT;
  }
}
