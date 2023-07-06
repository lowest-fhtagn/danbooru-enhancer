import * as htmlMinifier from "html-minifier-terser";
import * as path from "path";
import * as sass from "sass";

/**
 * Metadata for 'manifest.json'.
 */
const name = "Danbooru Enhancer";
const description = "Various tweaks to assist Danbooru users/contributors.";
const version = "0.1.1";
const extension_id = "{9e3b8949-1edc-40f5-a56a-26c38e23838f}";

const is_minify = true;

const entrypoints: string[] = [
  path.join(import.meta.dir, "src/background.ts"),
  path.join(import.meta.dir, "src/content_scripts/danbooru.ts"),
  path.join(import.meta.dir, "src/options.ts"),
];

const html_files: string[] = [path.join(import.meta.dir, "src/options.html")];

const sass_file = path.join(import.meta.dir, "src/sass/style.scss");

const output_directory = path.join(import.meta.dir, "dist");

/**
 * Write 'manifest.json'.
 */
Bun.write(
  path.join(output_directory, "manifest.json"),
  JSON.stringify({
    manifest_version: 2,
    name: name,
    description: description,
    version: version,

    permissions: ["contextMenus", "notifications", "storage"],

    content_scripts: [
      {
        matches: ["https://*.donmai.us/*"],
        js: ["danbooru.js"],
      },
    ],

    background: {
      scripts: ["background.js"],
      persistent: false,
    },

    browser_action: {
      default_icon: "icons/icon.svg",
      default_popup: "options.html",
    },

    options_ui: {
      page: "options.html",
    },

    browser_specific_settings: {
      gecko: {
        id: extension_id,
        update_url:
          "https://raw.githubusercontent.com/lowest-fhtagn/danbooru-enhancer/master/updates-firefox.json",
      },
    },

    icons: {
      48: "icons/icon-48.png",
      96: "icons/icon-96.png",
    },
  })
);

Bun.write(
  path.join(import.meta.dir, "updates-firefox.json"),
  JSON.stringify(
    {
      addons: {
        extension_id: {
          updates: [
            {
              version: version,
              update_link: `https://github.com/lowest-fhtagn/danbooru-enhancer/releases/download/v${version}/danbooru-enhancer-${version}.firefox.signed.xpi`,
            },
          ],
        },
      },
    },
    undefined,
    2
  )
);

Bun.build({
  entrypoints: entrypoints,
  outdir: output_directory,
  minify: is_minify,
});

const html_minifier_options: htmlMinifier.Options = {
  caseSensitive: true,
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  continueOnParseError: false,
  html5: true,
  includeAutoGeneratedTags: false,
  keepClosingSlash: false,
  maxLineLength: undefined,
  minifyCSS: false,
  minifyJS: true,
  minifyURLs: false,
  noNewlinesBeforeTagClose: true,
  preserveLineBreaks: true,
  preventAttributesEscaping: true,
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeTagWhitespace: false,
  useShortDoctype: true,
};

Promise.resolve().then(() => {
  for (let i = 0; i < html_files.length; i += 1) {
    Bun.file(html_files[i])
      .text()
      .then((t_value: string): Promise<string> => {
        return is_minify
          ? htmlMinifier.minify(t_value, html_minifier_options)
          : Promise.resolve(t_value);
      })
      .then((t_value: string) => {
        const basename = path.basename(html_files[i]);

        Bun.write(path.join(output_directory, basename), t_value);
      })
      .catch((reason: any) => {
        if (!(reason instanceof Error)) return;
        console.error(reason.message);
      });
  }
});

Promise.resolve().then(() => {
  const [file_name] = path.basename(sass_file).split(".", 1);

  if (!file_name.length) {
    throw Error("sass: Invalid file name.");
  }

  const sass_options: sass.Options<"sync"> = {
    loadPaths: ["."],
    charset: true,
    style: is_minify ? "compressed" : "expanded",
  };

  Bun.write(
    path.join(output_directory, file_name + ".css"),
    ((): string => sass.compile(sass_file, sass_options).css)()
  );
});
