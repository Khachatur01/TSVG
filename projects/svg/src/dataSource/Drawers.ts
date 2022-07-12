import {DrawRectangle} from "../service/tool/draw/element/shape/pointed/polygon/rectangle/DrawRectangle";
import {DrawLine} from "../service/tool/draw/element/shape/pointed/DrawLine";
import {DrawPolyline} from "../service/tool/draw/element/shape/pointed/polyline/DrawPolyline";
import {DrawEllipse} from "../service/tool/draw/element/shape/circular/DrawEllipse";
import {DrawPolygon} from "../service/tool/draw/element/shape/pointed/polygon/DrawPolygon";
import {DrawFree} from "../service/tool/draw/mode/DrawFree";
import {Container} from "../Container";
import {DrawIsoscelesTriangle} from "../service/tool/draw/element/shape/pointed/polygon/triangle/DrawIsoscelesTriangle";
import {DrawRightTriangle} from "../service/tool/draw/element/shape/pointed/polygon/triangle/DrawRightTriangle";
import {DrawTextBox} from "../service/tool/draw/element/foreign/DrawTextBox";
import {DrawGraphic} from "../service/tool/draw/element/foreign/DrawGraphic";
import {DrawVideo} from "../service/tool/draw/element/foreign/DrawVideo";
import {DrawImage} from "../service/tool/draw/element/foreign/DrawImage";
import {DrawForeignObject} from "../service/tool/draw/element/foreign/DrawForeignObject";
import {ElementType} from "./constant/ElementType";
import {Drawer} from "../service/tool/draw/Drawer";
import {DrawCircle} from "../service/tool/draw/element/shape/circular/DrawCircle";
import {DrawTable} from "../service/tool/draw/element/complex/DrawTable";
import {DrawText} from "../service/tool/draw/element/foreign/DrawText";

export class Drawers {
  private readonly container: Container;
  public readonly free: DrawFree;
  public readonly line: DrawLine;
  public readonly polyline: DrawPolyline;
  public readonly ellipse: DrawEllipse;
  public readonly circle: DrawCircle;
  public readonly polygon: DrawPolygon;
  public readonly rectangle: DrawRectangle;
  public readonly isoscelesTriangle: DrawIsoscelesTriangle;
  public readonly rightTriangle: DrawRightTriangle;
  public readonly textBox: DrawTextBox;
  public readonly text: DrawText;
  public readonly video: DrawVideo;
  public readonly image: DrawImage;
  public readonly foreignObject: DrawForeignObject;
  public readonly graphic: DrawGraphic;
  public readonly table: DrawTable;

  public constructor(container: Container) {
    this.container = container;

    this.free = new DrawFree(container);
    this.line = new DrawLine(container);
    this.polyline = new DrawPolyline(container);
    this.ellipse = new DrawEllipse(container);
    this.circle = new DrawCircle(container);
    this.polygon = new DrawPolygon(container);
    this.rectangle = new DrawRectangle(container);
    this.isoscelesTriangle = new DrawIsoscelesTriangle(container);
    this.rightTriangle = new DrawRightTriangle(container);
    this.textBox = new DrawTextBox(container);
    this.text = new DrawText(container);
    this.video = new DrawVideo(container);
    this.image = new DrawImage(container);
    this.foreignObject = new DrawForeignObject(container);
    this.graphic = new DrawGraphic(container);
    this.table = new DrawTable(container);
  }

  public getByType(type: ElementType): Drawer {
    switch (type) {
      case ElementType.ELLIPSE:
        return this.ellipse;
      case ElementType.CIRCLE:
        return this.circle;
      // case ElementType.BOX:
      //   return this._box;
      // case ElementType.PATH:
      //   return this._path;
      case ElementType.LINE:
        return this.line;
      case ElementType.FREE:
        return this.free;
      case ElementType.POLYLINE:
        return this.polyline;
      case ElementType.POLYGON:
        return this.polygon;
      // case ElementType.TRIANGLE:
      //   return this._triangle;
      case ElementType.RIGHT_TRIANGLE:
        return this.rightTriangle;
      case ElementType.ISOSCELES_TRIANGLE:
        return this.isoscelesTriangle;
      case ElementType.RECTANGLE:
        return this.rectangle;
      // case ElementType.GROUP:
      //   return this._group;
      case ElementType.FOREIGN_OBJECT:
        return this.foreignObject;
      case ElementType.TEXT_BOX:
        return this.textBox;
      case ElementType.TEXT:
        return this.text;
      case ElementType.IMAGE:
        return this.image;
      case ElementType.VIDEO:
        return this.video;
      case ElementType.GRAPHIC:
        return this.graphic;
      case ElementType.TABLE:
        return this.table;
      default:
        throw Error("Type is incorrect");
    }
  }
}
