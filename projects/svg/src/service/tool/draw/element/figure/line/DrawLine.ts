import {MoveDraw} from "../../../mode/MoveDraw";
import {LineView} from "../../../../../../element/shape/pointed/LineView";
import {Point} from "../../../../../../model/Point";
import {Angle} from "../../../../../math/Angle";
import {ElementView} from "../../../../../../element/ElementView";
import {TSVG} from "../../../../../../TSVG";
import {Callback} from "../../../../../../dataSource/constant/Callback";
import {PointedView} from "../../../../../../element/shape/pointed/PointedView";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";

export class DrawLine extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    let element = new LineView(this.container, position, position);
    element.fixPosition();
    return element;
  }

  public override makeMouseMove(position: Point, call: boolean = true) {
    if (this.container.grid.isSnap()) {
      position = this.container.grid.getSnapPoint({
        x: position.x,
        y: position.y
      });
    } else if (this.drawTool?.perfect) {
      position = Angle.snapLineEnd(this.startPos, position) as Point;
    }

    (this._drawableElement as PointedView).replacePoint(1, position);

    this.container.call(Callback.DRAW_MOUSE_MOVE,
      {position: position, element: this._drawableElement}
    );
  }

  protected override draw(event: MouseEvent | TouchEvent) {
    if (!this.container || !this._drawableElement) return;

    let eventPosition = TSVG.eventToPosition(event);
    event.preventDefault();

    let containerRect = this.container.HTML.getBoundingClientRect();
    this.makeMouseMove({
      x: eventPosition.x - containerRect.left,
      y: eventPosition.y - containerRect.top
    });
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.call(Callback.LINE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.LINE_TOOL_OFF);
    }
  }

  public _new(): DrawLine {
    return new DrawLine(this.container);
  }
  public get type(): ElementType {
    return ElementType.LINE;
  }
}
