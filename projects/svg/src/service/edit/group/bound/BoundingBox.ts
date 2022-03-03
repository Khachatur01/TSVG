import {Rect} from "../../../../model/Rect";
import {Grip} from "./grip/resize/Grip";
import {NWGrip} from "./grip/resize/corner/NWGrip";
import {NGrip} from "./grip/resize/side/NGrip";
import {NEGrip} from "./grip/resize/corner/NEGrip";
import {EGrip} from "./grip/resize/side/EGrip";
import {SEGrip} from "./grip/resize/corner/SEGrip";
import {SGrip} from "./grip/resize/side/SGrip";
import {SWGrip} from "./grip/resize/corner/SWGrip";
import {WGrip} from "./grip/resize/side/WGrip";
import {Point} from "../../../../model/Point";
import {TSVG} from "../../../../TSVG";
import {RefPoint} from "./grip/reference/RefPoint";
import {RotatePoint} from "./grip/rotate/RotatePoint";
import {ElementView} from "../../../../element/ElementView";
import {BoxView} from "../../../../element/shape/BoxView";
import {Size} from "../../../../model/Size";

export class BoundingBox extends BoxView {
  private _grips: Grip[] = [];
  private xRefPoint: RefPoint;
  private xRotatePoint: RotatePoint;
  private readonly _boundingBoxGroup: SVGGElement;
  private readonly _refPointGroup: SVGGElement;
  private _boundingRect: Rect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  public constructor(container: TSVG, position: Point = {x: 0, y: 0}, size: Size = {width: 0, height: 0}) {
    super(container, position, size);
    this.style.fillColor = "transparent";
    this.style.strokeColor = "#002fff";
    this.style.strokeWidth = "1";
    this.style.strokeDashArray = "2 2";

    this.svgElement.style.display = "none";
    this.removeOverEvent();

    this.xRefPoint = new RefPoint(container);
    this.xRotatePoint = new RotatePoint(container);
    this._grips.push(
      new NWGrip(container),
      new NGrip(container),

      new NEGrip(container),
      new EGrip(container),

      new SEGrip(container),
      new SGrip(container),

      new SWGrip(container),
      new WGrip(container)
    );

    /* create svg group */
    this._boundingBoxGroup = document.createElementNS(ElementView.svgURI, "g");
    this._boundingBoxGroup.id = "bounding-box";
    this._boundingBoxGroup.appendChild(this.svgElement);
    this._boundingBoxGroup.appendChild(this.xRotatePoint.SVG);
    for (let grip of this._grips) {
      this._boundingBoxGroup.appendChild(grip.SVG);
    }

    this._refPointGroup = document.createElementNS(ElementView.svgURI, "g");
    this._refPointGroup.id = "reference-point";
    this._refPointGroup.appendChild(this.xRefPoint.SVG);
  }

  public set transparentClick(transparent: boolean) {
    this.style.fillColor = transparent ? "none" : "transparent";
  }

  public get svgGroup(): SVGGElement {
    return this._boundingBoxGroup;
  }
  public get refPointGroup(): SVGGElement {
    return this._refPointGroup;
  }

  public fixRefPoint() {
    this.xRefPoint.fixPosition();
  }
  public set lastRefPoint(refPoint: Point) {
    this.xRefPoint.lastRefPoint = refPoint;
  }
  public get lastRefPoint(): Point {
    return this.xRefPoint.lastRefPoint;
  }

  public singleFocus(rotatable: boolean = true) {
    this.svgElement.style.display = "block";
    for (let grip of this._grips)
      grip.show();

    if (rotatable) {
      this.xRefPoint.show();
      this.xRotatePoint.show();
    } else {
      this.xRefPoint.hide();
      this.xRotatePoint.hide();
    }
  }
  public multipleFocus(rotatable: boolean = true) {
    this.svgElement.style.display = "block";
    /* more effective than with one loop and condition */
    // for(let i = 0; i < this._grips.length; i += 2) {
    //   this._grips[i].show();
    // }
    // for(let i = 1; i < this._grips.length; i += 2) {
    //   this._grips[i].hide();
    // }
    for (let grip of this._grips)
      grip.hide();

    if (rotatable) {
      this.xRefPoint.show();
      this.xRotatePoint.show();
    } else {
      this.xRefPoint.hide();
      this.xRotatePoint.hide();
    }
  }
  public blur() {
    this.svgElement.style.display = "none";
    for (let grip of this._grips)
      grip.hide();

    this.xRefPoint.hide();
    this.xRotatePoint.hide();
  }

  public override get boundingRect(): Rect {
    return this._boundingRect;
  }
  public override set boundingRect(value: Rect) {
    this._boundingRect = value;
  }

  public positionGrips() {
    let points: Point[] = this.points;
    let rect = this._boundingRect;

    rect.width = Math.abs(rect.width);
    rect.height = Math.abs(rect.height);

    points[0].x = rect.x;
    points[0].y = rect.y;

    points[1].x = rect.x + rect.width;
    points[1].y = rect.y;

    points[2].x = rect.x + rect.width;
    points[2].y = rect.y + rect.height;

    points[3].x = rect.x;
    points[3].y = rect.y + rect.height;

    if (!points || !this._grips) return
    for (let grip of this._grips)
      grip.setPosition(points);

    this.xRotatePoint.position = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    }
  }

  public correctByDelta(delta: Point) {
    this.position = delta;
    let position = this.position;
    let size = this.size;

    this._boundingRect = {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height
    }

    this.positionGrips();
  }

  public override correct(refPoint: Point, lastRefPoint: Point) {
    let delta = this.getCorrectionDelta(refPoint, lastRefPoint);
    this.correctByDelta(delta);
  }

  public override get refPoint(): Point {
    return this._refPoint;
  }
  public override set refPoint(refPoint: Point) {
    this._boundingBoxGroup.style.transformOrigin = refPoint.x + "px " + refPoint.y + "px";
    this._refPoint = refPoint;
  }

  public set refPointView(refPoint: Point) {
    this.xRefPoint.position = refPoint;
    this._refPointGroup.style.transformOrigin = refPoint.x + "px " + refPoint.y + "px";
  }

  public override rotate(angle: number): void {
    this._boundingBoxGroup.style.transform = "rotate(" + angle + "deg)";
    this._refPointGroup.style.transform = "rotate(" + angle + "deg)";

    this._angle = angle;
  }
}
