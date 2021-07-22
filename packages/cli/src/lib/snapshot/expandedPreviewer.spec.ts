import {ExpandedPreviewer} from './expandedPreviewer';

describe('ExpandedPreviewer', () => {
  describe('when there are more than 5 expanded preview stored', () => {
    it('should delete the exceeding the preview');
  });

  describe('when shouldDelete is false', () => {
    it('should not delete missing resources');
    it('should not delete missing resourceType/file');
  });

  describe('when shouldDelete is true', () => {
    it('should not delete missing resources');
    it('should not delete missing resourceType/file');
  });

  it('should download the before snapshot');
  it('should do two commits');
  it(
    "should replace the value of the 'before' snapshot with the one of the applied snapshot"
  );
});
