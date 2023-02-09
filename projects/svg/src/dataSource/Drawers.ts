import {DrawRectangle} from '../service/tool/draw/element/shape/pointed/polygon/rectangle/DrawRectangle';
import {DrawLine} from '../service/tool/draw/element/shape/pointed/DrawLine';
import {DrawPolyline} from '../service/tool/draw/element/shape/pointed/polyline/DrawPolyline';
import {DrawEllipse} from '../service/tool/draw/element/shape/circular/DrawEllipse';
import {DrawPolygon} from '../service/tool/draw/element/shape/pointed/polygon/DrawPolygon';
import {DrawFree} from '../service/tool/draw/mode/DrawFree';
import {DrawIsoscelesTriangle} from '../service/tool/draw/element/shape/pointed/polygon/triangle/DrawIsoscelesTriangle';
import {DrawRightTriangle} from '../service/tool/draw/element/shape/pointed/polygon/triangle/DrawRightTriangle';
import {DrawTextBox} from '../service/tool/draw/element/foreign/DrawTextBox';
import {DrawVideo} from '../service/tool/draw/element/foreign/DrawVideo';
import {DrawImage} from '../service/tool/draw/element/foreign/DrawImage';
import {DrawForeignObject} from '../service/tool/draw/element/foreign/DrawForeignObject';
import {ElementType} from './constant/ElementType';
import {Drawer} from '../service/tool/draw/Drawer';
import {DrawCircle} from '../service/tool/draw/element/shape/circular/DrawCircle';
import {DrawTable} from '../service/tool/draw/element/complex/DrawTable';
import {DrawText} from '../service/tool/draw/element/foreign/DrawText';
import {DrawTool} from '../service/tool/draw/DrawTool';
import {DrawCoordinatePlane} from "../service/tool/draw/element/complex/cartesian/DrawCoordinatePlane";
import {DrawNumberLine} from "../service/tool/draw/element/complex/cartesian/DrawNumberLine";

export class Drawers {
  private readonly drawTool: DrawTool;
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
  public readonly coordinatePlane: DrawCoordinatePlane;
  public readonly numberLine: DrawNumberLine;
  public readonly table: DrawTable;

  public constructor(drawTool: DrawTool) {
    this.drawTool = drawTool;

    this.free = new DrawFree(drawTool);
    this.line = new DrawLine(drawTool);
    this.polyline = new DrawPolyline(drawTool);
    this.ellipse = new DrawEllipse(drawTool);
    this.circle = new DrawCircle(drawTool);
    this.polygon = new DrawPolygon(drawTool);
    this.rectangle = new DrawRectangle(drawTool);
    this.isoscelesTriangle = new DrawIsoscelesTriangle(drawTool);
    this.rightTriangle = new DrawRightTriangle(drawTool);
    this.textBox = new DrawTextBox(drawTool);
    this.text = new DrawText(drawTool);
    this.video = new DrawVideo(drawTool);
    this.image = new DrawImage(drawTool);
    this.foreignObject = new DrawForeignObject(drawTool);
    this.coordinatePlane = new DrawCoordinatePlane(drawTool);
    this.numberLine = new DrawNumberLine(drawTool);
    this.table = new DrawTable(drawTool);
  }

  public getByType(type: ElementType): Drawer {
    switch (type) {
      case ElementType.ELLIPSE:
        return this.ellipse;
      case ElementType.CIRCLE:
        return this.circle;
      case ElementType.LINE:
        return this.line;
      case ElementType.FREE:
        return this.free;
      case ElementType.POLYLINE:
        return this.polyline;
      case ElementType.POLYGON:
        return this.polygon;
      case ElementType.RIGHT_TRIANGLE:
        return this.rightTriangle;
      case ElementType.ISOSCELES_TRIANGLE:
        return this.isoscelesTriangle;
      case ElementType.RECTANGLE:
        return this.rectangle;
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
      case ElementType.COORDINATE_PLANE2:
        return this.coordinatePlane;
      case ElementType.NUMBER_LINE2:
        return this.numberLine;
      case ElementType.TABLE:
        return this.table;
      default:
        throw Error('Type is incorrect');
    }
  }
}
