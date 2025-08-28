import { load } from "cheerio";
import fs from "node:fs";

const versionMap = new Map();

/**
 *
 * @param {string} str
 */
const parseVersionString = (str) => {
  const maybeMatch = str.match(
    /(Version [a-zA-Z0-9\(\) ]+) \(OS build ([0-9]+)\)/
  );

  if (maybeMatch && maybeMatch.length > 2) {
    const [_, version, build] = maybeMatch;
    return { version, build };
  } else {
    return null;
  }
};

const parseWin10 = async () => {
  const win10html = await fetch(
    "https://learn.microsoft.com/en-us/windows/release-health/release-information"
  );

  const win10text = await win10html.text();
  const win10map = new Map();

  const $ = load(win10text);

  const currentVersion = $("#windows-10-release-history")
    .siblings("strong")
    .text();

  const parsedCurrent = parseVersionString(currentVersion);

  if (parsedCurrent) {
    versionMap.set(parsedCurrent.build, {
      os: 10,
      version: parsedCurrent.version,
    });
  }

  const items = $("#windows-10-release-history")
    .siblings("details")
    .find("strong");

  items.each((_e, f) => {
    if (typeof f.children[0].data.trim() === "string") {
      const parsed = parseVersionString(f.children[0].data.trim());
      if (parsed) {
        versionMap.set(parsed.build, {
          os: 10,
          version: parsed.version,
        });
      }
    }
  });

  return win10map;
};

const parseWin11 = async () => {
  const win11html = await fetch(
    "https://learn.microsoft.com/en-us/windows/release-health/windows11-release-information"
  );

  const win11text = await win11html.text();
  const win11map = new Map();

  const $ = load(win11text);

  const currentVersion = $("#windows-11-release-history")
    .siblings("strong")
    .first()
    .text();

  const parsedCurrent = parseVersionString(currentVersion);

  if (parsedCurrent) {
    versionMap.set(parsedCurrent.build, {
      os: 11,
      version: parsedCurrent.version,
    });
  }

  const items = $("#windows-11-release-history")
    .siblings("details")
    .find("strong");

  items.each((_e, f) => {
    if (typeof f.children[0].data.trim() === "string") {
      const parsed = parseVersionString(f.children[0].data.trim());
      if (parsed) {
        versionMap.set(parsed.build, {
          os: 11,
          version: parsed.version,
        });
      }
    }
  });

  return win11map;
};

await parseWin10();
await parseWin11();

const zzz = JSON.stringify(Object.fromEntries(versionMap), null, 2);

fs.writeFileSync("./versions.json", zzz);
