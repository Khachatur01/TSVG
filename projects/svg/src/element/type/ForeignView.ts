import {ElementView} from '../ElementView';

export abstract class ForeignView extends ElementView {
  override __onFocus__(): void {
    this.__highlight__();
  }
  override __onBlur__(): void {
    this.__lowlight__();
  }
}
