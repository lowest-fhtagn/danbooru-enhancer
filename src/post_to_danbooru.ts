import * as regex from "./regex";
import * as utils from "./utils";

export default function (t_url: URL): void {
  if (regex.PIXIV.test(t_url.hostname)) {
    if (!regex.PIXIV_ARTWORKS.test(t_url.pathname)) {
      throw Error(`pixiv: ('${t_url.pathname}') is an invalid pathname`);
    }

    utils.cleanUrl(t_url);
    return;
  }

  if (regex.TWITTER.test(t_url.hostname)) {
    if (!regex.TWITTER_STATUS.test(t_url.pathname)) {
      throw Error(`Twitter: ('${t_url.pathname}') is an invalid pathname.`);
    }

    utils.cleanUrl(t_url);
    return;
  }

  if (regex.DANBOORU.test(t_url.hostname)) {
    throw Error("You are already in danbooru bro.");
  }
}
