import {ElementView} from "../ElementView";
import {Point} from "../../model/Point";
import {Rect} from "../../model/Rect";
import {Size} from "../../model/Size";
import {TSVG} from "../../TSVG";
import {PathView} from "./pointed/polyline/PathView";
import {ShapeView} from "../type/ShapeView";
import {ElementType} from "../../dataSource/constant/ElementType";

export class BoxView extends ShapeView {
  public constructor(container: TSVG, position: Point = {x: 0, y: 0}, size: Size = {width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement = document.createElementNS(ElementView.svgURI, "rect");
    this.type = ElementType.BOX;
    this.svgElement.id = this.id;

    this.position = position;
    this.setSize({
      x: position.x, y: position.y,
      width: size.width, height: size.height
    });

    this.setOverEvent();
  }

  public get copy(): BoxView {
    let position = this.position;
    let size = this.size;
    let box: BoxView = new BoxView(this._container);
    box.position = position;
    box.setSize({
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height
    });
    box.style.set = this.style;

    box.refPoint = Object.assign({}, this.refPoint);
    box.rotate(this._angle);

    return box;
  }

  public get points(): Point[] {
    let position: Point = this.position;
    let size: Size = this.size;

    return [
      position,
      {x: position.x, y: position.y + size.height},
      {x: position.x + size.width, y: position.y + size.height},
      {x: position.x + size.width, y: position.y},
    ];
  }

  public get position(): Point {
    return {
      x: parseInt(this.getAttr("x")),
      y: parseInt(this.getAttr("y"))
    };
  }
  public set position(delta: Point) {
    this.setAttr({
      x: this._lastPosition.x + delta.x + "",
      y: this._lastPosition.y + delta.y + ""
    });
  }

  public get size(): Size {
    return {
      width: parseInt(this.getAttr("width")),
      height: parseInt(this.getAttr("height"))
    };
  }
  public setSize(rect: Rect): void {
    if (rect.width < 0) {
      rect.width = -rect.width;
      rect.x -= rect.width;
    }
    if (rect.height < 0) {
      rect.height = -rect.height;
      rect.y -= rect.height;
    }

    this.setAttr({
      x: rect.x + "",
      y: rect.y + "",
      width: rect.width + "",
      height: rect.height + ""
    });
  }

  public get boundingRect(): Rect {
    let points = this.points;
    return this.calculateBoundingBox(points);
  }
  public get visibleBoundingRect(): Rect {
    let points = this.rotatedPoints;
    return this.calculateBoundingBox(points);
  }

  public override isComplete(): boolean {
    let size = this.size;
    return size.width != 0 && size.height != 0;
  }

  public override toPath(): PathView {
    return new PathView(this._container);
  }
}
