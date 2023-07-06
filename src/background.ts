import postToDanbooru from "./post_to_danbooru";
import searchArtist from "./search_artist";
import * as utils from "./utils";

const POST_TO_DANBOORU_URL = "https://danbooru.donmai.us/uploads/new?url=";
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
          utils.errorNotif(
            "Cannot process URL; URL is either undefined or is empty."
          );
          return;
        }

        let url: URL | undefined;

        try {
          url = new URL(url_string);
          postToDanbooru(url);
        } catch (error_object) {
          utils.errorNotif((error_object as Error).message);
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
          utils.errorNotif(
            "Cannot process URL; URL is either undefined or is empty."
          );
          return;
        }

        let url: URL | undefined;

        try {
          url = new URL(url_string);
          searchArtist(url);
        } catch (error_object) {
          utils.errorNotif((error_object as Error).message);
          return;
        }

        fetch(
          "https://danbooru.donmai.us/artists.json?search%5Burl_matches%5D=" +
            encodeURIComponent(url.href)
        )
          .then((t_response: Response): Promise<any> => {
            if (!t_response.ok) {
              throw Error(t_response.statusText);
            }

            return t_response.json();
          })
          .then((t_json: any) => {
            if (!Array.isArray(t_json)) {
              throw Error("Invalid JSON response.");
            }

            if (!t_json.length) {
              throw Error("This artist does not exist in Danbooru's database.");
            }

            const artist_id = t_json[0].id;
            if (typeof artist_id !== "number") {
              throw Error("Invalid JSON response.");
            }

            // if (t_json.length > 1) {
            //   const artist_name = t_json[0].name;
            //   if (typeof artist_name === "string") {
            //     console.warn(
            //       `Artist "${artist_name}" (id: ${artist_id}) has multiple artist entries.`
            //     );
            //   } else {
            //     console.warn(
            //       `This artist (id: ${artist_id}) has multiple artist entries.`
            //     );
            //   }
            // }

            utils.openLink(`https://danbooru.donmai.us/artists/${artist_id}`);
          })
          .catch((reason: any) => {
            if (reason instanceof Error) {
              utils.errorNotif(reason.message);
            }
          });
      }
    }
  }
);
