import {DrawRectangle} from '../service/tool/draw/element/shape/pointed/polygon/rectangle/DrawRectangle';
import {DrawLine} from '../service/tool/draw/element/shape/pointed/DrawLine';
import {DrawPolyline} from '../service/tool/draw/element/shape/pointed/polyline/DrawPolyline';
import {DrawEllipse} from '../service/tool/draw/element/shape/circular/DrawEllipse';
import {DrawPolygon} from '../service/tool/draw/element/shape/pointed/polygon/DrawPolygon';
import {FreeDrawer} from '../service/tool/draw/mode/FreeDrawer';
import {DrawIsoscelesTriangle} from '../service/tool/draw/element/shape/pointed/polygon/triangle/DrawIsoscelesTriangle';
import {DrawRightTriangle} from '../service/tool/draw/element/shape/pointed/polygon/triangle/DrawRightTriangle';
import {DrawTextBox} from '../service/tool/draw/element/foreign/DrawTextBox';
import {DrawCoordinatePlane} from '../service/tool/draw/element/complex/cartesian/DrawCoordinatePlane';
import {DrawVideo} from '../service/tool/draw/element/foreign/DrawVideo';
import {DrawImage} from '../service/tool/draw/element/foreign/DrawImage';
import {DrawForeignObject} from '../service/tool/draw/element/foreign/DrawForeignObject';
import {ElementType} from './constant/ElementType';
import {Drawer} from '../service/tool/draw/Drawer';
import {DrawCircle} from '../service/tool/draw/element/shape/circular/DrawCircle';
import {DrawTable} from '../service/tool/draw/element/complex/DrawTable';
import {DrawText} from '../service/tool/draw/element/foreign/DrawText';
import {DrawNumberLine} from '../service/tool/draw/element/complex/cartesian/DrawNumberLine';
import {DrawRay} from '../service/tool/draw/element/complex/cartesian/DrawRay';
import {DrawGraphic} from '../service/tool/draw/element/complex/cartesian/DrawGraphic';
import {DrawTool} from '../service/tool/draw/DrawTool';
import {DrawCoordinatePlane2} from '../service/tool/draw/element/complex/cartesian2/DrawCoordinatePlane2';
import {DrawNumberLine2} from '../service/tool/draw/element/complex/cartesian2/DrawNumberLine2';

export class Drawers {
  private readonly drawTool: DrawTool;
  public readonly free: FreeDrawer;
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
  public readonly ray: DrawRay;
  public readonly coordinatePlane: DrawCoordinatePlane;
  public readonly numberLine: DrawNumberLine;
  public readonly coordinatePlane2: DrawCoordinatePlane2;
  public readonly numberLine2: DrawNumberLine2;
  public readonly table: DrawTable;

  public constructor(drawTool: DrawTool) {
    this.drawTool = drawTool;

    this.free = new FreeDrawer(drawTool);
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
    this.graphic = new DrawGraphic(drawTool);
    this.ray = new DrawRay(drawTool);
    this.coordinatePlane = new DrawCoordinatePlane(drawTool);
    this.numberLine = new DrawNumberLine(drawTool);
    this.coordinatePlane2 = new DrawCoordinatePlane2(drawTool);
    this.numberLine2 = new DrawNumberLine2(drawTool);
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
      case ElementType.GRAPHIC:
        return this.graphic;
      case ElementType.RAY:
        return this.ray;
      case ElementType.COORDINATE_PLANE:
        return this.coordinatePlane;
      case ElementType.NUMBER_LINE:
      case ElementType.COORDINATE_PLANE2:
        return this.coordinatePlane2;
      case ElementType.NUMBER_LINE2:
        return this.numberLine2;
      case ElementType.TABLE:
        return this.table;
      default:
        throw Error('Type is incorrect');
    }
  }
}
