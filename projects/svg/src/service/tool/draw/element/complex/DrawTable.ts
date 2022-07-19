import {MoveDraw} from "../../mode/MoveDraw";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ElementView} from "../../../../../element/ElementView";
import {Point} from "../../../../../model/Point";
import {TableView} from "../../../../../element/complex/TableView";
import {Event} from "../../../../../dataSource/constant/Event";
import {MoveDrawable} from "../../type/MoveDrawable";

export class DrawTable extends MoveDraw {
  protected createDrawableElement(position: Point): MoveDrawable {
    return new TableView(this.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 1, height: 1}, 3, 4);
  }

  public override makeMouseDown(position: Point, call: boolean = true) {
    super.makeMouseDown(position, call);
    this._drawableElement?.__fixRect__();
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.TABLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.TABLE_TOOL_OFF);
    }
  }

  public _new(): DrawTable {
    return new DrawTable(this.container);
  }

  get type(): ElementType {
    return ElementType.TABLE;
  }
}
