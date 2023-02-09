/* eslint-disable @typescript-eslint/naming-convention */
import {ElementView} from '../ElementView';

export abstract class ForeignView extends ElementView {
  override __onFocus__() {
    this.__highlight__();
  }
  override __onBlur__() {
    this.__lowlight__();
  }
}
