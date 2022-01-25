import {Result} from '@coveo/atomic/headless';
import {Component, h, Element} from '@stencil/core';
import {resultContext} from '@coveo/atomic';

/**
 * Sample custom Atomic result component, to be used inside an Atomic Result Template.
 */
@Component({
  tag: 'sample-result-component',
  styleUrl: 'sample-result-component.css',
  shadow: true,
})
export class SampleResultComponent {
  private result?: Result;
  @Element() private host!: Element;

  // It is recommended to fetch the result context using the connectedCallback lifecycle method.
  public async connectedCallback() {
    try {
      this.result = await resultContext(this.host);
    } catch (error) {
      console.error(error);
      this.host.remove();
    }
  }

  public render() {
    if (!this.result) {
      return;
    }

    const author = this.result.raw['author'] || 'anonymous';
    return (
      <h4>
        Written by: <b>{author}</b>
      </h4>
    );
  }
}
