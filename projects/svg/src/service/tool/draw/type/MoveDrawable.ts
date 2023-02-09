/* eslint-disable @typescript-eslint/naming-convention */
import {Rect} from '../../../../model/Rect';
import {Drawable} from './Drawable';

export interface MoveDrawable extends Drawable {
  /*
      This function sets size on drawing.
      Elements, which draw by moving,
      that elements must set size different on drawing
  */
  __drawSize__(rect: Rect): void;
}
