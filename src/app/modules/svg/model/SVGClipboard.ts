import {ElementView} from '@app/modules/svg/element/ElementView';

export interface SVGClipboard {
  elements: Set<ElementView>;
  text: string;
  isSafe: boolean;
}
