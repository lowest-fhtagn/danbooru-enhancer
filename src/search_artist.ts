import * as regex from "./regex";
import * as utils from "./utils";

const PIXIV_USERS_RE = /^(?:\/en)?\/users\/(\d+)(?:\/.*)?$/i;

const FANBOX_RE = /^(?:\w*\.)?fanbox\.cc$/i;

const FANTIA_RE = /^(?:www\.)?fantia\.jp$/i;
const FANTIA_FANCLUBS_RE = /^\/fanclubs\/(\d+)(?:\/.*)?$/i;

export default function (t_url: URL) {
  let result: RegExpExecArray | null;

  if (regex.PIXIV.test(t_url.hostname)) {
    if (null === (result = PIXIV_USERS_RE.exec(t_url.pathname))) {
      throw Error(`pixiv: ('${t_url.pathname}') is an invalid pathname.`);
    }

    utils.cleanUrl(t_url);
    t_url.hostname = "www.pixiv.net";
    t_url.pathname = `/users/${result[1]}`;
    return;
  }

  if (regex.TWITTER.test(t_url.hostname)) {
    const [, first_path] = t_url.pathname.split("/", 2);
    switch (first_path) {
      case "":
      case "i":
      case "home":
      case "explore":
      case "notifications":
      case "messages":
      case "settings":
      case "compose":
      case "account":
      case "logout":
      case "follower_requests":
        throw Error(`Twitter: ('${first_path}') is an invalid pathname.`);
    }

    utils.cleanUrl(t_url);
    t_url.hostname = "twitter.com";
    t_url.pathname = `/${first_path}`;
    return;
  }

  if (FANBOX_RE.test(t_url.hostname)) {
    const [subdomain] = t_url.hostname.split(".", 2);

    if (subdomain === "www" || subdomain === "fanbox") {
      if (!t_url.pathname.startsWith("/@")) {
        throw Error(`FANBOX: ('${t_url.pathname}') is an invalid pathname.`);
      }

      const [, username] = t_url.pathname.split("/", 2);

      /**
       * Throw an error if 'username' is just the character '@' for some
       * reason.
       */
      if (username.length === 1) {
        throw Error("FANBOX: ('/@') is an invalid pathname.");
      }

      t_url.hostname = `${username.substring(1)}.fanbox.cc`;
    }

    utils.cleanUrl(t_url);
    t_url.pathname = "";
    return;
  }

  if (FANTIA_RE.test(t_url.hostname)) {
    if (null === (result = FANTIA_FANCLUBS_RE.exec(t_url.pathname))) {
      throw Error(`Fantia: ('${t_url.pathname}') is an invalid pathname.`);
    }

    utils.cleanUrl(t_url);
    t_url.hostname = "fantia.jp";
    t_url.pathname = `/fanclubs/${result[1]}`;
    return;
  }

  if (regex.DANBOORU.test(t_url.hostname)) {
    throw Error("You are already in danbooru bro.");
  }
}
