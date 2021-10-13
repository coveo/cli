describe('ResourceTypePrompt - Integration Test', () => {
  describe('when started', () => {
    it.todo('should display the question');
    it.todo('should display the TODO_INSERT_# first options');
  });
  //#region Refactor that
  describe('when pressing a', () => {
    it.todo('should select Add for the highlighted resource if possible');
    it.todo(
      'should do nothing if the resource/operation association is invalid'
    );
  });
  describe('when pressing s', () => {
    it.todo('should select Skip for the highlighted resource');
    it.todo(
      'should do nothing if the resource/operation association is invalid'
    );
  });
  describe('when pressing e', () => {
    it.todo('should select Edit for the highlighted resource');
    it.todo(
      'should do nothing if the resource/operation association is invalid'
    );
  });
  describe('when pressing d', () => {
    it.todo('should select Delete for the highlighted resource');
    it.todo(
      'should do nothing if the resource/operation association is invalid'
    );
  });
  //#endregion
  //#region Refactor maybe
  describe('when pressing left arrow key', () => {
    it.todo('should select the next value on the left if there is one');
    it.todo(
      'should select the most right value if there is no other value on the left'
    );
  });
  describe('when pressing left arrow key', () => {
    it.todo('should select the next value on the right if there is one');
    it.todo(
      'should select the most left value if there is no other value on the right'
    );
  });
  describe('when pressing up arrow key', () => {
    it.todo('should select the previous key if there is one');
    it.todo('should do nothing if there is no previous key');
  });
  describe('when pressing down arrow key', () => {
    it.todo('should select the next key if there is one');
    it.todo('should do nothing if there is no next key');
  });
  //#endregion
  describe('when pressing space bar', () => {
    it.todo('should select the highlighted value for the highlighted resource');
  });
  describe('when pressing enter', () => {
    it.todo('should resolves the promise with the returned values');
  });
});
