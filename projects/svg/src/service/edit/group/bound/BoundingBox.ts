/* eslint-disable @typescript-eslint/naming-convention */
import {Rect} from '../../../../model/Rect';
import {Grip} from './grip/resize/Grip';
import {NWGrip} from './grip/resize/corner/NWGrip';
import {NGrip} from './grip/resize/side/NGrip';
import {NEGrip} from './grip/resize/corner/NEGrip';
import {EGrip} from './grip/resize/side/EGrip';
import {SEGrip} from './grip/resize/corner/SEGrip';
import {SGrip} from './grip/resize/side/SGrip';
import {SWGrip} from './grip/resize/corner/SWGrip';
import {WGrip} from './grip/resize/side/WGrip';
import {Point} from '../../../../model/Point';
import {Container} from '../../../../Container';
import {RefPoint} from './grip/reference/RefPoint';
import {RotatePoint} from './grip/rotate/RotatePoint';
import {ElementView} from '../../../../element/ElementView';
import {BoxView} from '../../../../element/shape/BoxView';
import {Focus} from '../Focus';
import {Compass} from '../../../../dataSource/constant/Compass';
import {Cursor} from '../../../../dataSource/constant/Cursor';

export class BoundingBox extends BoxView {
  public perfect = false; /* for rotate point */

  private _grips: Grip[] = [];
  private referencePoint: RefPoint;
  private rotatePoint: RotatePoint;
  private readonly _boundingBoxGroup: SVGGElement;
  private readonly _refPointGroup: SVGGElement;
  private readonly focus: Focus;

  public constructor(container: Container, focus: Focus, rect: Rect = {x: 0, y: 0, width: 0, height: 0}) {
    super(container, {overEvent: false, globalStyle: false}, rect);
    this.style.fillColor = 'transparent';
    this.style.strokeColor = '#002fff';
    this.style.strokeWidth = '1';
    this.style.strokeDashArray = '2 2';

    this.svgElement.style.cursor = this._container.style.cursor[Cursor.BOUNDING_BOX];
    this.svgElement.style.display = 'none';

    this.focus = focus;
    this.referencePoint = new RefPoint(container, this.focus, 0, 0);
    this.rotatePoint = new RotatePoint(container, this.focus, 0, 0);

    this._grips[Compass.NW] = new NWGrip(container, this.focus);
    this._grips[Compass.N] = new NGrip(container, this.focus);

    this._grips[Compass.NE] = new NEGrip(container, this.focus);
    this._grips[Compass.E] = new EGrip(container, this.focus);

    this._grips[Compass.SE] = new SEGrip(container, this.focus);
    this._grips[Compass.S] = new SGrip(container, this.focus);

    this._grips[Compass.SW] = new SWGrip(container, this.focus);
    this._grips[Compass.W] = new WGrip(container, this.focus);

    /* create svg group */
    this._boundingBoxGroup = document.createElementNS(ElementView.svgURI, 'g');
    this._boundingBoxGroup.id = 'bounding-box';
    this._boundingBoxGroup.appendChild(this.svgElement);
    this._boundingBoxGroup.appendChild(this.rotatePoint.SVG);
    for (const grip of this._grips) {
      this._boundingBoxGroup.appendChild(grip.SVG);
    }

    this._refPointGroup = document.createElementNS(ElementView.svgURI, 'g');
    this._refPointGroup.id = 'reference-point';
    this._refPointGroup.appendChild(this.referencePoint.SVG);
  }

  public set __transparentClick__(transparent: boolean) {
    this.style.fillColor = transparent ? 'none' : 'transparent';
  }

  public get __svgGroup__(): SVGGElement {
    return this._boundingBoxGroup;
  }
  public get __refPointGroup__(): SVGGElement {
    return this._refPointGroup;
  }

  public override __fixRefPoint__() {
    this.referencePoint.__fixPosition__();
  }
  public get __lastRefPoint__(): Point {
    return this.referencePoint.__lastPosition__;
  }

  public __singleFocus__(rotatable: boolean = true) {
    this.svgElement.style.display = 'block';
    for (const grip of this._grips) {
      grip.__show__();
    }

    if (rotatable) {
      this.referencePoint.__show__();
      this.rotatePoint.__show__();
    } else {
      this.referencePoint.__hide__();
      this.rotatePoint.__hide__();
    }
  }
  public __onlyCircleFocus__(rotatable: boolean = true) {
    this.svgElement.style.display = 'block';
    for (let i = 0; i < this._grips.length; i += 2) {
      this._grips[i].__show__();
    }

    if (rotatable) {
      this.referencePoint.__show__();
      this.rotatePoint.__show__();
    } else {
      this.referencePoint.__hide__();
      this.rotatePoint.__hide__();
    }
  }
  public __multipleFocus__(rotatable: boolean = true) {
    this.svgElement.style.display = 'block';
    /* more effective than with one loop and condition */
    // for(let i = 0; i < this._grips.length; i += 2) {
    //   this._grips[i].show();
    // }
    // for(let i = 1; i < this._grips.length; i += 2) {
    //   this._grips[i].hide();
    // }
    for (const grip of this._grips) {
      grip.__hide__();
    }

    if (rotatable) {
      this.referencePoint.__show__();
      this.rotatePoint.__show__();
    } else {
      this.referencePoint.__hide__();
      this.rotatePoint.__hide__();
    }
  }

  public __blur__() {
    this.__rotate__(0);
    this.svgElement.style.display = 'none';
    for (const grip of this._grips) {
      grip.__hide__();
    }

    this.referencePoint.__hide__();
    this.rotatePoint.__hide__();
  }

  public override get points(): Point[] {
    return super.points;
  }

  public __positionGrips__() {
    this._rect.width = Math.abs(this._rect.width);
    this._rect.height = Math.abs(this._rect.height);

    const points = this.points;
    if (/*!points || */!this._grips) {return;}
    for (const grip of this._grips) {
      grip.__setPosition__(points);
    }

    this.rotatePoint.__setPosition__({
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    });
  }

  public override __correct__(refPoint: Point, lastRefPoint: Point) {
    const delta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    this.__drag__(delta);
    this.__positionGrips__();
  }

  public override get refPoint(): Point {
    return this._refPoint;
  }
  public override set refPoint(refPoint: Point) {
    this._boundingBoxGroup.style.transformOrigin = refPoint.x + 'px ' + refPoint.y + 'px';
    this._refPoint = refPoint;
  }

  public set __refPointView__(refPoint: Point) {
    this.referencePoint.__setPosition__(refPoint);
    this._refPointGroup.style.transformOrigin = refPoint.x + 'px ' + refPoint.y + 'px';
  }

  public override __rotate__(angle: number): void {
    this._boundingBoxGroup.style.transform = 'rotate(' + angle + 'deg)';
    this._refPointGroup.style.transform = 'rotate(' + angle + 'deg)';

    this._angle = angle;
  }

  public makeResizeMouseDown(position: Point, compass: number, call: boolean = true) {
    this._grips[compass].makeMouseDown(position, call);
  }
  public makeResizeMouseMove(position: Point, compass: number, call: boolean = true) {
    this._grips[compass].makeMouseMove(position, call);
  }
  public makeResizeMouseUp(position: Point, compass: number, call: boolean = true) {
    this._grips[compass].makeMouseUp(position, call);
  }

  public makeRefPointMouseDown(position: Point, call: boolean = true) {
    this.referencePoint.makeMouseDown(position, call);
  }
  public makeRefPointMouseMove(position: Point, call: boolean = true) {
    this.referencePoint.makeMouseMove(position, call);
  }
  public makeRefPointMouseUp(position: Point, call: boolean = true) {
    this.referencePoint.makeMouseUp(position, call);
  }

  public makeRotateMouseDown(position: Point, call: boolean = true) {
    this.rotatePoint.makeMouseDown(position, call);
  }
  public makeRotateMouseMove(position: Point, call: boolean = true) {
    this.rotatePoint.makeMouseMove(position, call);
  }
  public makeRotateMouseUp(position: Point, call: boolean = true) {
    this.rotatePoint.makeMouseUp(position, call);
  }

  public __on__() {
    this.rotatePoint.__on__();
    this.referencePoint.__on__();
    this._grips.forEach((grip: Grip) => {
      grip.__on__();
    });
  }
  public __off__() {
    this.rotatePoint.__off__();
    this.referencePoint.__off__();
    this._grips.forEach((grip: Grip) => {
      grip.__off__();
    });
  }
}
