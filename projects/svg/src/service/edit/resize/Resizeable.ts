import {Rect} from '../../../model/Rect';

export interface Resizeable {
  proportionalResizable: boolean;

  get __lastRect__(): Rect;

  getRect(): Rect;

  __setRect__(rect: Rect): void;

  __fixRect__(): void;
}
