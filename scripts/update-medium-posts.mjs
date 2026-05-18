import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const feedUrl = "https://medium.com/feed/@chrisiscode";
const mediumProfileUrl = "https://medium.com/@chrisiscode";
const outputPath = "data/medium-posts.json";
const maxPosts = 8;
const excerptLength = 180;

function getTagValue(xml, tagName) {
     const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
     return match ? cleanText(match[1]) : "";
}

function getCategoryValues(xml) {
     return [...xml.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)]
          .map((match) => cleanText(match[1]))
          .filter(Boolean);
}

function decodeEntities(value) {
     return value
          .replaceAll("<![CDATA[", "")
          .replaceAll("]]>", "")
          .replaceAll("&amp;", "&")
          .replaceAll("&lt;", "<")
          .replaceAll("&gt;", ">")
          .replaceAll("&quot;", '"')
          .replaceAll("&#39;", "'")
          .replaceAll("&apos;", "'");
}

function stripHtml(value) {
     return value
          .replace(/<figure[\s\S]*?<\/figure>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<[^>]+>/g, " ");
}

function normalizeWhitespace(value) {
     return value.replace(/\s+/g, " ").trim();
}

function cleanText(value) {
     return normalizeWhitespace(stripHtml(decodeEntities(value)));
}

function truncate(value, length) {
     if (value.length <= length) {
          return value;
     }

     return `${value.slice(0, length).trimEnd()}...`;
}

function toIsoDate(value) {
     const date = new Date(value);

     if (Number.isNaN(date.getTime())) {
          return "";
     }

     return date.toISOString().slice(0, 10);
}

function cleanUrl(value) {
     try {
          const url = new URL(value);
          const isUserSubdomain = url.hostname === "chrisiscode.medium.com";

          url.search = "";
          url.hash = "";

          if (isUserSubdomain) {
               return `${mediumProfileUrl}${url.pathname}`;
          }

          return url.toString();
     } catch {
          return value;
     }
}

async function main() {
     const response = await fetch(feedUrl, {
          headers: {
               "User-Agent": "cgoss-dev medium feed updater"
          }
     });

     if (!response.ok) {
          throw new Error(`Medium feed request failed: ${response.status} ${response.statusText}`);
     }

     const xml = await response.text();
     const itemBlocks = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);

     const posts = itemBlocks.slice(0, maxPosts).map((item) => {
          const title = getTagValue(item, "title");
          const url = cleanUrl(getTagValue(item, "link"));
          const published = toIsoDate(getTagValue(item, "pubDate"));
          const encodedContent = getTagValue(item, "content:encoded");
          const description = getTagValue(item, "description");
          const content = truncate(encodedContent || description, excerptLength);
          const categories = getCategoryValues(item);
          const tags = categories.length > 0 ? categories.slice(0, 3) : ["medium"];

          return {
               title,
               url,
               content,
               published,
               tags
          };
     }).filter((post) => post.title && post.url && post.published);

     await mkdir(dirname(outputPath), { recursive: true });
     await writeFile(outputPath, `${JSON.stringify(posts, null, 2)}\n`);
}

main().catch((error) => {
     console.error(error);
     process.exit(1);
});
