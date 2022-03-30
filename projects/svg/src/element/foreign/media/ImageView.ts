import {ElementCursor, ElementView} from "../../ElementView";
import {PathView} from "../../shape/pointed/PathView";
import {Size} from "../../../model/Size";
import {Rect} from "../../../model/Rect";
import {Point} from "../../../model/Point";
import {TSVG} from "../../../TSVG";
import {ForeignView} from "../../type/ForeignView";
import {MoveDrawable} from "../../../service/tool/draw/type/MoveDrawable";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {Cursor} from "../../../dataSource/constant/Cursor";

export class ImageCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT] = "default";
  }
}

export class ImageView extends ForeignView implements MoveDrawable {
  public constructor(container: TSVG, position: Point = {x: 0, y: 0}, size: Size = {width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement = document.createElementNS(ElementView.svgURI, "image");
    this._type = ElementType.IMAGE;
    this.svgElement.id = this.id;

    this.svgElement.ondragstart = function () {
      return false;
    }

    this.position = position;

    this.setSize({
      x: position.x, y: position.y,
      width: size.width, height: size.height
    });
    this.setOverEvent();

    this.setAttr({
      preserveAspectRatio: "none"
    });
  }

  public get copy(): ImageView {
    let position = this.position;
    let size = this.size;

    let image: ImageView = new ImageView(this._container);
    image.src = this.src;
    image.position = position;
    image.setSize({
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height
    });

    image.refPoint = Object.assign({}, this.refPoint);
    image.rotate(this._angle);

    image.style.set = this.style;

    return image;
  }

  public get position(): Point {
    return {
      x: parseInt(this.getAttr("x")),
      y: parseInt(this.getAttr("y"))
    };
  }
  public set position(delta: Point) {
    this.setAttr({
      x: this._lastPosition.x + delta.x,
      y: this._lastPosition.y + delta.y
    });
  }

  public override correct(refPoint: Point, lastRefPoint: Point) {
    let delta = this.getCorrectionDelta(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;
    let position = this.position;

    this.setAttr({
      x: position.x + delta.x,
      y: position.y + delta.y
    });
  }

  public get size(): Size {
    return {
      width: parseInt(this.getAttr("width")),
      height: parseInt(this.getAttr("height"))
    };
  }
  public drawSize(rect: Rect) {
    this.setSize(rect);
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
    let points = this.visiblePoints;
    return this.calculateBoundingBox(points);
  }

  public get src(): string {
    return this.getAttr("href");
  }
  public set src(URI: string) {
    this.setAttr({href: URI});
  }

  public isComplete(): boolean {
    let size = this.size;
    return size.width > 0 && size.height > 0;
  }

  public toPath(): PathView {
    return new PathView(this._container);
  }
}
