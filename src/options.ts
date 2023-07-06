type StorageObject = { [key: string]: any };

function saveToStorage(t_element: HTMLInputElement, t_key: string) {
  t_element.addEventListener("input", () => {
    const t_object: { [key: string]: boolean } = {};
    t_object[t_key] = t_element.checked;
    browser.storage.local.set(t_object);
  });
}

Promise.resolve().then(() => {
  const open_in_new_tab = document.getElementById(
    "open-in-new-tab"
  )! as HTMLInputElement;
  const move_to_new_tab = document.getElementById(
    "move-to-new-tab"
  )! as HTMLInputElement;

  const sticky_danbooru_header = document.getElementById(
    "sticky-danbooru-header"
  )! as HTMLInputElement;
  const sticky_danbooru_sidebar = document.getElementById(
    "sticky-danbooru-sidebar"
  )! as HTMLInputElement;
  const show_switch_server = document.getElementById(
    "show-switch-server"
  )! as HTMLInputElement;
  const display_logo = document.getElementById(
    "display-logo"
  )! as HTMLInputElement;

  open_in_new_tab.addEventListener("input", () => {
    move_to_new_tab.disabled = !open_in_new_tab.checked;
    browser.storage.local.set({ open_in_new_tab: open_in_new_tab.checked });
  });

  saveToStorage(move_to_new_tab, "move_to_new_tab");
  saveToStorage(sticky_danbooru_header, "sticky_danbooru_header");
  saveToStorage(sticky_danbooru_sidebar, "sticky_danbooru_sidebar");
  saveToStorage(show_switch_server, "show_switch_server");
  saveToStorage(display_logo, "display_logo");

  browser.storage.local.get().then((t_value: StorageObject) => {
    let flag: any;
    if (typeof (flag = t_value.open_in_new_tab) === "boolean")
      open_in_new_tab.checked = flag;
    if (typeof (flag = t_value.move_to_new_tab) === "boolean")
      move_to_new_tab.checked = flag;

    if (typeof (flag = t_value.sticky_danbooru_header) === "boolean")
      sticky_danbooru_header.checked = flag;
    if (typeof (flag = t_value.sticky_danbooru_sidebar) === "boolean")
      sticky_danbooru_sidebar.checked = flag;
    if (typeof (flag = t_value.show_switch_server) === "boolean")
      show_switch_server.checked = flag;
    if (typeof (flag = t_value.display_logo) === "boolean")
      display_logo.checked = flag;
  });
});
