import {Rect} from "../../../../model/Rect";

export interface MoveDrawable {
  /*
      This function sets size on drawing.
      Elements, which draw by moving,
      that elements must set size different on drawing
  */
  __drawSize__(rect: Rect): void;
}
