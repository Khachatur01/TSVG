import {Point} from '../../../../model/Point';
import {Rect} from '../../../../model/Rect';
import {PathView} from '../../../../element/shape/path/PathView';
import {ElementType} from '../../../../dataSource/constant/ElementType';
import {Container} from '../../../../Container';
import {GroupView} from '../../../../element/group/GroupView';
import {ElementProperties} from '../../../../element/ElementView';
import {Line} from '../../../../model/Line';

export interface Drawable {
  get properties(): ElementProperties;
  setProperties(properties: ElementProperties): void;
  __translate__(delta: Point): void;
  __drag__(delta: Point): void;
  getVisibleRect(): Rect;
  getRect(): Rect;
/**
 * if delta is set, calculate rect width and height by delta
 * */
  __setRect__(rect: Rect): void;

  __updateView__(): void;
  get visiblePoints(): Point[];
  get points(): Point[];

  toPath(): PathView;
  get copy(): Drawable;
  isComplete(): boolean;

  intersectsRect(rect: Rect): boolean;
  intersectsLine(line: Line): boolean;

  __onFocus__(): void;
  __onBlur__(): void;

  get type(): ElementType;

  get id(): string;
  setId(ownerId: string, index: number): void;

  get ownerId(): string;
  set ownerId(ownerId: string);

  get index(): number;
  set index(index: number);

  get container(): Container;
  set container(container: Container);

  __correct__(refPoint: Point, lastRefPoint: Point): void;
  __getCorrectionDelta__(refPoint: Point, lastRefPoint: Point): Point;

  get group(): GroupView | null;
  set group(group: GroupView | null);

  get center(): Point;

  get refPoint(): Point;
  set refPoint(refPoint: Point);

  get angle(): number;
  __rotate__(angle: number): void;

  get SVG(): SVGElement;
  get HTML(): SVGElement | HTMLElement;

  getAttr(attribute: string): string;
  setAttr(attributes: object): void;
  delAttr(attributes: string[]): void;
  set cursor(cursor: string);

  setOverEvent(): void;
  removeOverEvent(): void;
  __remove__(): void;

  get selectable(): boolean;
  set selectable(selectable: boolean);

  __highlight__(): void;
  __lowlight__(): void;

  __fixRect__(): void;
  __fixAngle__(): void;

  get __lastRect__(): Rect;
  get __lastAngle__(): number;

  toJSON(): any;
  fromJSON(json: any): void;
}
