import {ElementView} from "../ElementView";
import {Point} from "../../model/Point";

export abstract class ComplexView extends ElementView {
  /** if ComplexView is svg element
  override __translate__(delta: Point) {
    if (delta.x == 0 && delta.y == 0) {
      this.delAttr(["x", "y"]);
    } else {
      this.setAttr({
        x: delta.x,
        y: delta.y
      });
    }
  }*/

  override __onFocus__() {
    this.__highlight__();
  }
  override __onBlur__() {
    this.__lowlight__();
  }
}
