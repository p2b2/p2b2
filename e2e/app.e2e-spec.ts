import { P2b2FrontendPage } from './app.po';

describe('p2b2-frontend App', () => {
  let page: P2b2FrontendPage;

  beforeEach(() => {
    page = new P2b2FrontendPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
