import {Rect} from '../../../../model/Rect';
import {Drawable} from './Drawable';
import {Resizeable} from "../../../edit/resize/Resizeable";

export interface MoveDrawable extends Drawable, Resizeable {
  /*
      This function sets the size on drawing.
      Elements, which draw by moving,
      that element must set size different on drawing
  */
  __drawSize__(rect: Rect): void;
}
