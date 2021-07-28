describe('#recursiveDirectoryDiff', () => {
  describe('when deleteMissingFile is true', () => {
    it.todo(
      'should delete files present in the currentDir but not in the nextDir'
    );
    it.todo(
      'should delete keys present in the currentDir but not in the nextDir'
    );
  });

  describe('when deleteMissingFile is false', () => {
    it.todo(
      'should preserve files present in the currentDir but not in the nextDir'
    );
    it.todo(
      'should preserve keys present in the currentDir but not in the nextDir'
    );
  });

  it.todo(
    'should create files present in the nextDir but not in the currentDir'
  );
  it.todo(
    'should create keys present in the nextDir but not in the currentDir'
  );
  it.todo(
    'should replace the value of keys present in the nextDir and in the currentDir'
  );
});
