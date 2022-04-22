import {MoveDraw} from "../../../mode/MoveDraw";
import {LineView} from "../../../../../../element/shape/pointed/LineView";
import {Point} from "../../../../../../model/Point";
import {Angle} from "../../../../../math/Angle";
import {ElementView} from "../../../../../../element/ElementView";
import {Container} from "../../../../../../Container";
import {Event} from "../../../../../../dataSource/constant/Event";
import {PointedView} from "../../../../../../element/shape/pointed/PointedView";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";
import {ClickDraw} from "../../../mode/ClickDraw";

// export class DrawLine extends MoveDraw {
//   protected createDrawableElement(position: Point): ElementView {
//     let element = new LineView(this.container, position, position);
//     element.__fixRect__();
//     return element;
//   }
//
//   public override makeMouseMove(position: Point, call: boolean = true) {
//     if (this.container.grid.isSnap()) {
//       position = this.container.grid.getSnapPoint({
//         x: position.x,
//         y: position.y
//       });
//     } else if (this.drawTool?.perfect) {
//       position = Angle.snapLineEnd(this.startPos, position) as Point;
//     }
//
//     (this._drawableElement as PointedView).replacePoint(1, position);
//
//     this.container.__call__(Event.DRAW_MOUSE_MOVE,
//       {position: position, element: this._drawableElement}
//     );
//   }
//
//   protected override draw(event: MouseEvent | TouchEvent) {
//     if (!this.container || !this._drawableElement) return;
//
//     let eventPosition = Container.__eventToPosition__(event);
//     event.preventDefault();
//
//     let containerRect = this.container.HTML.getBoundingClientRect();
//     this.makeMouseMove({
//       x: eventPosition.x - containerRect.left,
//       y: eventPosition.y - containerRect.top
//     });
//   }
//
//   public override start(call: boolean = true) {
//     super.start(call);
//
//     if (call) {
//       this.container.__call__(Event.LINE_TOOL_ON);
//     }
//   }
//   public override stop(call: boolean = true) {
//     super.stop(call);
//
//     if (call) {
//       this.container.__call__(Event.LINE_TOOL_OFF);
//     }
//   }
//
//   public _new(): DrawLine {
//     return new DrawLine(this.container);
//   }
//   public get type(): ElementType {
//     return ElementType.LINE;
//   }
// }
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
