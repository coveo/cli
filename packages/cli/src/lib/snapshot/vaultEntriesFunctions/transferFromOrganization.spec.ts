describe('#tryTransferFromOrganization', () => {
  describe('when there is no origin organization attached to the snapshot', () => {
    it.todo('should return false');
  });
  describe('when the user refuse to transfer', () => {
    it.todo('should return false');
  });
  describe('when the user does not have access to the origin organization', () => {
    it.todo('should warn the user about their lack of access');
    it.todo('should return false');
  });
  describe('when all the prechecks are OK', () => {
    it.todo('should get all the vault entries from the origin organization');
    describe('when the origin org does not have all the vault entries missing from the target org', () => {
      it.todo(
        'should warn with a `SnapshotMissingVaultEntriesFromOriginError`'
      );
      it.todo('should return false');
    });

    describe('when the origin org does have all the vault entries from the target org', () => {
      it.todo(
        'should try to transfer the vault entries from the origin org to the destination org'
      );
      describe('when the transfer fails', () => {
        it.todo(
          'should warn the user and bubble up the error from the backend'
        );
        it.todo('should return false');
      });
      describe('when the transfer is succesful', () => {
        it.todo('should retrun true');
      });
    });
  });
});
