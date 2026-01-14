describe('App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should launch the app', async () => {
    await expect(element(by.type('RCTRootView'))).toBeVisible();
  });
});
