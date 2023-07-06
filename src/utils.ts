export function cleanUrl(t_url: URL) {
  t_url.hash = "";
  t_url.password = "";
  t_url.port = "";
  t_url.protocol = "https:";
  t_url.search = "";
  t_url.username = "";
}

export function errorNotif(
  t_err_message: string,
  t_err_title = "Danbooru Enhancer: Error"
): Promise<string> {
  return browser.notifications.create({
    type: "basic",
    title: t_err_title,
    message: t_err_message,
  });
}

export function openLink(t_url_string: string) {
  browser.storage.local
    .get(["open_in_new_tab", "move_to_new_tab"])
    .then((value: { [key: string]: any }): void => {
      const open_in_new_tab = ((): boolean => {
        switch (typeof value.open_in_new_tab) {
          case "boolean":
            return value.open_in_new_tab;
          default:
            return true;
        }
      })();

      if (!open_in_new_tab) {
        browser.tabs.update({ url: t_url_string });
        return;
      }

      const move_to_new_tab = ((): boolean => {
        switch (typeof value.move_to_new_tab) {
          case "boolean":
            return value.move_to_new_tab;
          default:
            return true;
        }
      })();

      browser.tabs
        .query({
          currentWindow: true,
          active: true,
        })
        .then((t_tabs: browser.tabs.Tab[]): void => {
          browser.tabs.create({
            active: move_to_new_tab,
            index: t_tabs[0].index + 1,
            url: t_url_string,
          });
        })
        .catch((): void => {
          browser.tabs.create({ url: t_url_string });
        });
    });
}
