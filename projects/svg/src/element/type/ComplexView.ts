import {ElementView} from "../ElementView";

export abstract class ComplexView extends ElementView {
  override __onFocus__() {
    this.__highlight__();
  }
  override __onBlur__() {
    this.__lowlight__();
  }
}
