import {Point} from '../../../model/Point';

export interface CartesianEditable {
  zoomIn(factor: number): void;
  zoomOut(factor: number): void;
  __moveOrigin__(delta: Point): void;
  __fixRect__(): void;
  __onFocus__(): void;
}
