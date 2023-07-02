import postToDanbooru from "./post_to_danbooru";
import searchArtist from "./search_artist";
import * as utils from "./utils";

const POST_TO_DANBOORU_URL = "https://danbooru.donmai.us/uploads/new?url=";
const SEARCH_ARTIST_URL =
  "https://danbooru.donmai.us/artists?search%5Burl_matches%5D=";
const ALLOWED_PROTOCOLS = ["*://*/*"];

const MenuId = {
  PostToDanbooruImage: browser.contextMenus.create({
    id: "q",
    title: "Post Image to Danbooru",
    contexts: ["image"],
    targetUrlPatterns: ALLOWED_PROTOCOLS,
  }) as string,

  PostToDanbooruLink: browser.contextMenus.create({
    id: "w",
    title: "Post Link to Danbooru",
    contexts: ["link"],
    targetUrlPatterns: ALLOWED_PROTOCOLS,
  }) as string,

  PostToDanbooruPage: browser.contextMenus.create({
    id: "e",
    title: "Post Page to Danbooru",
    contexts: ["page"],
    documentUrlPatterns: ALLOWED_PROTOCOLS,
  }) as string,

  SearchArtistLink: browser.contextMenus.create({
    id: "r",
    title: "Search Artist in Danbooru",
    contexts: ["link"],
    targetUrlPatterns: ALLOWED_PROTOCOLS,
  }) as string,

  SearchArtistPage: browser.contextMenus.create({
    id: "t",
    title: "Search Artist in Danbooru",
    contexts: ["page"],
    documentUrlPatterns: ALLOWED_PROTOCOLS,
  }) as string,
} as const;

const NOTIFICATIONS_ERROR_TITLE = "Danbooru Enhancer: Error";

browser.contextMenus.onClicked.addListener(
  (t_info: browser.contextMenus.OnClickData): void => {
    switch (t_info.menuItemId) {
      case MenuId.PostToDanbooruImage:
      case MenuId.PostToDanbooruLink:
      case MenuId.PostToDanbooruPage: {
        const url_string = ((): string | undefined => {
          switch (t_info.menuItemId) {
            case MenuId.PostToDanbooruImage:
              return t_info.srcUrl;
            case MenuId.PostToDanbooruLink:
              return t_info.linkUrl;
            case MenuId.PostToDanbooruPage:
              return t_info.pageUrl;
            default:
              return undefined;
          }
        })();

        if (!url_string || !url_string.length) {
          browser.notifications.create("", {
            type: "basic",
            title: NOTIFICATIONS_ERROR_TITLE,
            message: "Cannot process URL; URL is either undefined or is empty.",
          });
          return;
        }

        let url: URL | undefined;

        try {
          url = new URL(url_string);
          postToDanbooru(url);
        } catch (error_object) {
          browser.notifications.create("", {
            type: "basic",
            title: NOTIFICATIONS_ERROR_TITLE,
            message: (error_object as Error).message,
          });
          return;
        }

        utils.openLink(POST_TO_DANBOORU_URL + encodeURIComponent(url.href));
        return;
      }
      case MenuId.SearchArtistLink:
      case MenuId.SearchArtistPage: {
        const url_string =
          t_info.menuItemId === MenuId.SearchArtistLink
            ? t_info.linkUrl
            : t_info.pageUrl;

        if (!url_string || !url_string.length) {
          browser.notifications.create("", {
            type: "basic",
            title: NOTIFICATIONS_ERROR_TITLE,
            message: "Cannot process URL; URL is either undefined or is empty.",
          });
          return;
        }

        let url: URL | undefined;

        try {
          url = new URL(url_string);
          searchArtist(url);
        } catch (error_object) {
          browser.notifications.create("", {
            type: "basic",
            title: NOTIFICATIONS_ERROR_TITLE,
            message: (error_object as Error).message,
          });
          return;
        }

        utils.openLink(SEARCH_ARTIST_URL + encodeURIComponent(url.href));
      }
    }
  }
);
