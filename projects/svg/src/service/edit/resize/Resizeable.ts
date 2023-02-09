/* eslint-disable @typescript-eslint/naming-convention */
import {Rect} from '../../../model/Rect';

export interface Resizeable {
  get __lastRect__(): Rect;

  getRect(): Rect;

  __setRect__(rect: Rect): void;

  __fixRect__(): void;
}
