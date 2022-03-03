import {Rect} from "../../../../model/Rect";

export interface MoveDrawable {
  drawSize(rect: Rect): void;
}
