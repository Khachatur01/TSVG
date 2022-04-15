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
import {DrawAsset} from "../service/tool/draw/element/foreign/DrawAsset";
import {ElementType} from "./constant/ElementType";
import {Drawer} from "../service/tool/draw/Drawer";
import {DrawCircle} from "../service/tool/draw/element/shape/circular/DrawCircle";

export class DrawTools {
  private readonly container: Container;
  private readonly _free: DrawFree;
  private readonly _line: DrawLine;
  private readonly _polyline: DrawPolyline;
  private readonly _ellipse: DrawEllipse;
  private readonly _circle: DrawCircle;
  private readonly _polygon: DrawPolygon;
  private readonly _rectangle: DrawRectangle;
  private readonly _isoscelesTriangle: DrawIsoscelesTriangle;
  private readonly _rightTriangle: DrawRightTriangle;
  private readonly _textBox: DrawTextBox;
  private readonly _video: DrawVideo;
  private readonly _image: DrawImage;
  private readonly _asset: DrawAsset;
  private readonly _graphic: DrawGraphic;

  public constructor(container: Container) {
    this.container = container;

    this._free = new DrawFree(container);
    this._line = new DrawLine(container);
    this._polyline = new DrawPolyline(container);
    this._ellipse = new DrawEllipse(container);
    this._circle = new DrawCircle(container);
    this._polygon = new DrawPolygon(container);
    this._rectangle = new DrawRectangle(container);
    this._isoscelesTriangle = new DrawIsoscelesTriangle(container);
    this._rightTriangle = new DrawRightTriangle(container);
    this._textBox = new DrawTextBox(container);
    this._video = new DrawVideo(container);
    this._image = new DrawImage(container);
    this._asset = new DrawAsset(container);
    this._graphic = new DrawGraphic(container);
  }

  public get free(): DrawFree {
    return this._free;
  }
  public get line(): DrawLine {
    return this._line;
  }
  public get polyline(): DrawPolyline {
    return this._polyline;
  }
  public get ellipse(): DrawEllipse {
    return this._ellipse;
  }
  public get circle(): DrawCircle {
    return this._circle;
  }
  public get polygon(): DrawPolygon {
    return this._polygon;
  }
  public get rectangle(): DrawRectangle {
    return this._rectangle;
  }
  public get isoscelesTriangle(): DrawIsoscelesTriangle {
    return this._isoscelesTriangle;
  }
  public get rightTriangle(): DrawRightTriangle {
    return this._rightTriangle;
  }
  public get textBox(): DrawTextBox {
    return this._textBox;
  }
  public get video(): DrawVideo {
    return this._video;
  }
  public get image(): DrawImage {
    return this._image;
  }
  public get asset(): DrawAsset {
    return this._asset;
  }
  public get graphic(): DrawGraphic {
    return this._graphic;
  }

  public getByType(type: ElementType): Drawer {
    switch (type) {
      case ElementType.ELLIPSE:
        return this._ellipse;
      case ElementType.CIRCLE:
        return this._circle;
      // case ElementType.BOX:
      //   return this._box;
      // case ElementType.PATH:
      //   return this._path;
      case ElementType.LINE:
        return this._line;
      case ElementType.FREE:
        return this._free;
      case ElementType.POLYLINE:
        return this._polyline;
      case ElementType.POLYGON:
        return this._polygon;
      // case ElementType.TRIANGLE:
      //   return this._triangle;
      case ElementType.RIGHT_TRIANGLE:
        return this._rightTriangle;
      case ElementType.ISOSCELES_TRIANGLE:
        return this._isoscelesTriangle;
      case ElementType.RECTANGLE:
        return this._rectangle;
      // case ElementType.GROUP:
      //   return this._group;
      case ElementType.FOREIGN_OBJECT:
        return this._asset;
      case ElementType.TEXT_BOX:
        return this._textBox;
      case ElementType.IMAGE:
        return this._image;
      case ElementType.VIDEO:
        return this._video;
      case ElementType.GRAPHIC:
        return this._graphic;
      default:
        throw Error("Type is incorrect");
    }
  }
}
