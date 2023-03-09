import {ComplexView} from '../../type/ComplexView';
import {ElementType} from '../../../dataSource/constant/ElementType';
import {TextView} from '../../foreign/text/TextView';
import {Rect} from '../../../model/Rect';

export abstract class CartesianView2 extends ComplexView  {
  protected abstract override _type: ElementType;
  protected abstract override svgElement: SVGElement;
  protected _numbersVisible: boolean = true;
  protected _borderVisible: boolean = true;

  protected readonly ARROW_LENGTH: number = 5;
  protected readonly ARROW_MARGIN: number = 5;

  protected xAxisNumber(x: number, xAxisY: number, value: number, drag: boolean = true): TextView {
    const numberView: TextView = new TextView(this._container);
    if (drag) {
      numberView.__drag__({x, y: xAxisY + 15});
    }
    numberView.style.fontSize = '10';
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

  public get numbersVisible(): boolean {
    return this._numbersVisible;
  }
  public get borderVisible(): boolean {
    return this._borderVisible;
  }
}
