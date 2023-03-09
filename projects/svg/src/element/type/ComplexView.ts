import {ElementView} from '../ElementView';

export abstract class ComplexView extends ElementView {
  override __onFocus__(): void {
    this.__highlight__();
  }
  override __onBlur__(): void {
    this.__lowlight__();
  }
}
