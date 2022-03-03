import {ElementView} from "../ElementView";
import {Point} from "../../model/Point";
import {Size} from "../../model/Size";

export abstract class ForeignView extends ElementView {
  get points(): Point[] {
    let position: Point = this.position;
    let size: Size = this.size;

    return [
      position,
      {x: position.x, y: position.y + size.height},
      {x: position.x + size.width, y: position.y + size.height},
      {x: position.x + size.width, y: position.y},
    ];
  }

  override onFocus() {
  }

  override onBlur() {
  }
}
