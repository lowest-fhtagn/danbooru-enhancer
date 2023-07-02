const SWITCH_SUBDOMAIN_ID = "danbooru-enhancer-switch-button";
const DETAILS_ELEMENT_ID = "danbooru-enhancer-tags-details";
const STICKY_DIV_ID = "danbooru-enhancer-sticky-div";

type StorageObject = { [key: string]: any };

const [subdomain] = document.location.hostname.split(".", 1);

const is_safebooru = ((): boolean => {
  if (subdomain === "safebooru") return true;
  return false;
})();

Promise.resolve().then((): Promise<void> | undefined => {
  if (is_safebooru) return;

  /**
   * Save the last NSFW subdomain visited in the local storage, ignoring
   * "safebooru" and "testbooru".
   */
  switch (subdomain) {
    case "danbooru":
    case "hijiribe":
    case "sonohara":
      return browser.storage.local.set({ last_unsafe_subdomain: subdomain });
  }
});

/**
 * Hide the Danbooru logo (default: show).
 */
Promise.resolve().then((): void => {
  const header = document.getElementById("app-name-header");
  if (!header) return;

  browser.storage.local
    .get("display_logo")
    .then((t_items: StorageObject): void => {
      switch (typeof t_items.display_logo) {
        case "boolean":
          if (t_items.display_logo) return;
          break;
        default:
          return;
      }

      header.style.display = "none";
    });
});

/**
 * Add "Switch to Danbooru/Safebooru" button onto the header (default: show).
 */
Promise.resolve().then((): void => {
  if (document.location.hostname.startsWith("testbooru")) {
    return;
  }

  const main_menu_element = document.getElementById("main-menu");

  if (!main_menu_element || document.getElementById(SWITCH_SUBDOMAIN_ID)) {
    return;
  }

  let current_subdomain = "";

  browser.storage.local
    .get("show_switch_server")
    .then((t_items: StorageObject): boolean => {
      switch (typeof t_items.show_switch_server) {
        case "boolean":
          return t_items.show_switch_server;
      }
      return true;
    })
    .then((t_enable: boolean): StorageObject | undefined =>
      t_enable ? browser.storage.local.get("last_unsafe_subdomain") : undefined
    )
    .then((t_items?: StorageObject): void => {
      if (!t_items) return;

      if (is_safebooru) {
        current_subdomain = ((): string => {
          if (typeof t_items.last_unsafe_subdomain === "string") {
            switch (t_items.last_unsafe_subdomain) {
              case "danbooru":
              case "hijiribe":
              case "sonohara":
                return t_items.last_unsafe_subdomain;
            }
          }
          return "danbooru";
        })();
      }

      const list_element = document.createElement("li");
      list_element.id = SWITCH_SUBDOMAIN_ID;

      const anchor_element = document.createElement("a");

      list_element.appendChild(anchor_element);
      main_menu_element.appendChild(list_element);

      anchor_element.style.fontWeight = "bold";

      anchor_element.href = ((): string => {
        const new_url = new URL(document.URL);
        new_url.hostname = is_safebooru
          ? `${current_subdomain}.donmai.us`
          : "safebooru.donmai.us";
        return new_url.href;
      })();

      anchor_element.textContent = is_safebooru
        ? "Switch to Danbooru »"
        : "Switch to Safebooru »";
    });
});

Promise.resolve().then((): void => {
  const header_element = document.getElementById("top");
  if (!header_element) return;

  let is_sticky_header = false;

  browser.storage.local
    .get("sticky_danbooru_header")
    .then((t_value: StorageObject): void => {
      switch (typeof t_value.sticky_danbooru_header) {
        case "boolean":
          if (false === t_value.sticky_danbooru_header) return;
      }

      const body_element = document.getElementsByTagName("body")[0];
      body_element.style.height = "auto";

      header_element.style.position = "sticky";
      header_element.style.top = "0";
      header_element.style.zIndex = "999";

      is_sticky_header = true;
    })
    .then((): void => {
      /**
       * Ensure that this script will only work on
       * "https://*.donmai.us/posts".
       */
      if (document.location.pathname !== "/posts") return;

      /**
       * Ensure that the script won't make duplicates (in case the extension
       * is reloaded).
       */
      if (document.getElementById(DETAILS_ELEMENT_ID)) return;

      const sidebar_element = document.getElementById("sidebar");
      if (!sidebar_element) return;

      const tag_box_element = document.getElementById("tag-box");

      do {
        if (!tag_box_element) break;

        const tag_list_elements = document.getElementsByClassName(
          "tag-list search-tag-list"
        );
        if (!tag_list_elements.length) break;

        /**
         * Remove "<h2>Tags</h2>" element from the "tag-box" element.
         *
         * The code below assumes that the first child of the "tag-box"
         * element is the "h2" element.
         */
        if (tag_box_element.children[0].tagName === "H2") {
          tag_box_element.children[0].remove();
        }

        // for (let i = 0; i < tag_box_element.children.length; i += 1) {
        //   if (tag_box_element.children[i].tagName === "H2") {
        //     tag_box_element.children[i].remove();
        //     break;
        //   }
        // }

        const details_element = document.createElement("details");
        const summary_element = document.createElement("summary");
        const h2_element = document.createElement("h2");

        details_element.id = DETAILS_ELEMENT_ID;
        details_element.open = true;
        h2_element.textContent = "Tags";
        h2_element.style.display = "inline";

        tag_box_element.appendChild(details_element);
        details_element.appendChild(summary_element);
        summary_element.appendChild(h2_element);

        details_element.appendChild(tag_box_element.children[0]);

        // for (let i = 0; i < tag_list_elements.length; i += 1) {
        //   details_element.appendChild(tag_list_elements[i]);
        // }

        /**
         * Load the <details> element's 'open' state from the local storage if
         * it exists.
         */
        browser.storage.local
          .get("tag_list_details_toggled")
          .then((t_value: StorageObject): void => {
            switch (typeof t_value.tag_list_details_toggled) {
              case "boolean":
                details_element.open = t_value.tag_list_details_toggled;
            }
          });

        /**
         * Save the <details> element's 'open' state in the local storage.
         */
        details_element.addEventListener("toggle", (): void => {
          browser.storage.local.set({
            tag_list_details_toggled: details_element.open,
          });
        });
      } while (false);

      const flex_div = document.createElement("div");
      flex_div.style.display = "flex";
      flex_div.style.flexDirection = "column";
      flex_div.style.rowGap = "1em";

      const sticky_div = document.createElement("div");
      sticky_div.id = STICKY_DIV_ID;

      sticky_div.appendChild(flex_div);
      sidebar_element.appendChild(sticky_div);

      browser.storage.local
        .get("sticky_danbooru_sidebar")
        .then((t_object: StorageObject): void => {
          switch (typeof t_object.sticky_danbooru_sidebar) {
            case "boolean":
              if (false === t_object.sticky_danbooru_sidebar) return;
          }

          sticky_div.style.position = "sticky";
          sticky_div.style.top = "1em";

          if (is_sticky_header) {
            function updateStickySidebarPosition(): void {
              const header_element = document.getElementById("top");
              if (!header_element) return;

              const sticky_sidebar = document.getElementById(STICKY_DIV_ID);
              if (!sticky_sidebar) return;

              /**
               * The seemingly-random magic number "16" below is actually the size
               * of margin-top of the element id="page".
               */
              sticky_sidebar.style.top = `${
                header_element.offsetHeight + 16
              }px`;
            }

            updateStickySidebarPosition();

            let timeout_id: number | undefined = undefined;
            window.addEventListener("resize", function (): void {
              this.clearTimeout(timeout_id);
              timeout_id = this.setTimeout(updateStickySidebarPosition, 500);
            });
          }
        });

      let foo: HTMLElement | null;

      (foo = document.getElementById("search-box"))
        ? flex_div.appendChild(foo)
        : void 0;
      (foo = document.getElementById("mode-box"))
        ? flex_div.appendChild(foo)
        : void 0;

      if ((foo = document.getElementById("blacklist-box")) !== null) {
        foo.style.marginBottom = "0";
        flex_div.appendChild(foo);
      }

      tag_box_element ? flex_div.appendChild(tag_box_element) : void 0;

      (foo = document.getElementById("options-box"))
        ? flex_div.appendChild(foo)
        : void 0;
      (foo = document.getElementById("related-box"))
        ? flex_div.appendChild(foo)
        : void 0;
    });
});
