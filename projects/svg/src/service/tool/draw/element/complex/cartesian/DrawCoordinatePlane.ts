import {Point} from "../../../../../../model/Point";
import {CoordinatePlaneView} from "../../../../../../element/complex/cartesian/CoordinatePlaneView";
import {MoveDraw} from "../../../mode/MoveDraw";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";
import {ElementView} from "../../../../../../element/ElementView";
import {Event} from "../../../../../../dataSource/constant/Event";
import {MoveDrawable} from "../../../type/MoveDrawable";

export class DrawCoordinatePlane extends MoveDraw {
  public functions: {f: Function, color?: string, width?: number}[] = [];
  protected createDrawableElement(position: Point): ElementView {
    let coordinatePlane = new CoordinatePlaneView(this.container, {overEvent: true, globalStyle: false}, {x: position.x, y: position.y, width: 1, height: 1});
    this.functions.forEach(f => {
      coordinatePlane.addFunction(f.f, f.color, f.width);
    });
    return coordinatePlane;
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    (this._drawableElement as unknown as MoveDrawable).__drawSize__({
      x: this.startPosition.x - 150,
      y: this.startPosition.y - 150,
      width: 300,
      height: 300
    });
    this._drawableElement.refPoint = this._drawableElement.center;
  }
  protected override onEnd(call: boolean) {
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.COORDINATE_PLANE_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.COORDINATE_PLANE_TOOL_OFF);
    }
  }

  public _new(): DrawCoordinatePlane {
    return new DrawCoordinatePlane(this.container);
  }
  public get type(): ElementType {
    return ElementType.COORDINATE_PLANE;
  }
}
