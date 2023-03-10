import {ComplexView} from '../../type/ComplexView';
import {ElementType} from '../../../dataSource/constant/ElementType';
import {TextView} from '../../foreign/text/TextView';
import {Rect} from '../../../model/Rect';
import {RectangleView} from '../../shape/pointed/polygon/rectangle/RectangleView';
import {Container} from '../../../Container';
import {ElementView} from '../../ElementView';

export abstract class CartesianView2 extends ComplexView  {
  protected abstract override _type: ElementType;
  protected abstract override svgElement: SVGElement;
  protected _numbersVisible: boolean = true;
  protected _borderVisible: boolean = true;

  protected readonly _background: RectangleView;
  protected readonly numbersGroup: SVGGElement;
  protected readonly axisGroup: SVGGElement;
  protected readonly labelsGroup: SVGGElement;

  protected readonly ARROW_LENGTH: number = 5;
  protected readonly ARROW_MARGIN: number = 10;

  protected _numberSize: number = 10;

  protected constructor(
              container: Container,
              ownerId?: string,
              index?: number
  ) {
    super(container, ownerId, index);

    this.numbersGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.numbersGroup.style.shapeRendering = 'optimizespeed';
    this.numbersGroup.id = 'numbers';
    this.axisGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.axisGroup.style.shapeRendering = 'optimizespeed';
    this.axisGroup.id = 'axis';
    this.axisGroup.style.strokeLinecap = 'square';
    this.axisGroup.style.strokeLinejoin = 'initial';
    this.labelsGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.labelsGroup.style.shapeRendering = 'optimizespeed';
    this.labelsGroup.id = 'labels';

    this._background = new RectangleView(this._container, {overEvent: false, globalStyle: false});
    this._background.SVG.style.shapeRendering = 'optimizespeed';
    this._background.style.strokeColor = '#000000';
    this._background.style.fillColor = 'none';
    this._background.style.strokeWidth = '1';
  }

  protected xAxisNumber(x: number, xAxisY: number, value: number): TextView {
    const numberView: TextView = new TextView(this._container);
    numberView.style.fontSize = this._numberSize + '';
    numberView.style.strokeWidth = '1';
    numberView.text = value + '';
    return numberView;
  }
  protected yAxisNumber(y: number, yAxisX: number, value: number): TextView {
    const numberView: TextView = new TextView(this._container);
    numberView.style.fontSize = this._numberSize + '';
    numberView.style.strokeWidth = '1';
    numberView.text = value + '';
    return numberView;
  }

  public getAreaRect(): Rect {
    return { /* rect without arrow and arrow margin */
      x: this._rect.x + this.ARROW_LENGTH + this.ARROW_MARGIN,
      y: this._rect.y + this.ARROW_LENGTH + this.ARROW_MARGIN,
      width: this._rect.width - (this.ARROW_LENGTH + this.ARROW_MARGIN) * 2,
      height: this._rect.height - (this.ARROW_LENGTH + this.ARROW_MARGIN) * 2
    };
  }

  public get numberSize(): number {
    return this._numberSize;
  }
  public get numbersVisible(): boolean {
    return this._numbersVisible;
  }
  public get borderVisible(): boolean {
    return this._borderVisible;
  }
}
