import { NextRouter } from "next/router";

const noop = () => {};
const noopPromise = (): Promise<boolean> => new Promise((resolve, reject) => resolve(true));
export function createMockRouter(router: Partial<NextRouter>): NextRouter {
  const mockRouter: NextRouter = {
    route: "/",
    pathname: "/",
    query: {},
    asPath: "/",
    basePath: "",
    defaultLocale: "en",
    domainLocales: [],
    isLocaleDomain: false,
    locales: ["en", "es", "fr", "ja", "pt-BR", "ru", "zh-CN", "zh-TW"],
    push: () => noopPromise(),
    replace: () => noopPromise(),
    reload: noop,
    back: noop,
    forward: noop,
    prefetch: () => new Promise((resolve, reject) => resolve()),
    beforePopState: noop,
    isFallback: false,
    isReady: true,
    isPreview: false,
    events: {
      on: noop,
      off: noop,
      emit: noop,
    },
    ...router,
  };
  return mockRouter;
}
