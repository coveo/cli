/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import {HTMLStencilElement, JSXBase} from '@stencil/core/internal';
export namespace Components {
  interface ResultsManager {}
  interface SampleComponent {}
  interface SampleResultComponent {}
}
declare global {
  interface HTMLResultsManagerElement
    extends Components.ResultsManager,
      HTMLStencilElement {}
  var HTMLResultsManagerElement: {
    prototype: HTMLResultsManagerElement;
    new (): HTMLResultsManagerElement;
  };
  interface HTMLSampleComponentElement
    extends Components.SampleComponent,
      HTMLStencilElement {}
  var HTMLSampleComponentElement: {
    prototype: HTMLSampleComponentElement;
    new (): HTMLSampleComponentElement;
  };
  interface HTMLSampleResultComponentElement
    extends Components.SampleResultComponent,
      HTMLStencilElement {}
  var HTMLSampleResultComponentElement: {
    prototype: HTMLSampleResultComponentElement;
    new (): HTMLSampleResultComponentElement;
  };
  interface HTMLElementTagNameMap {
    'results-manager': HTMLResultsManagerElement;
    'sample-component': HTMLSampleComponentElement;
    'sample-result-component': HTMLSampleResultComponentElement;
  }
}
declare namespace LocalJSX {
  interface ResultsManager {}
  interface SampleComponent {}
  interface SampleResultComponent {}
  interface IntrinsicElements {
    'results-manager': ResultsManager;
    'sample-component': SampleComponent;
    'sample-result-component': SampleResultComponent;
  }
}
export {LocalJSX as JSX};
declare module '@stencil/core' {
  export namespace JSX {
    interface IntrinsicElements {
      'results-manager': LocalJSX.ResultsManager &
        JSXBase.HTMLAttributes<HTMLResultsManagerElement>;
      'sample-component': LocalJSX.SampleComponent &
        JSXBase.HTMLAttributes<HTMLSampleComponentElement>;
      'sample-result-component': LocalJSX.SampleResultComponent &
        JSXBase.HTMLAttributes<HTMLSampleResultComponentElement>;
    }
  }
}
