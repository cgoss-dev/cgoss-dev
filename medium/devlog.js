/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: DEV LOG */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function getFirstSentences(text, amount) {
  const segmenter = new Intl.Segmenter(undefined, {
    granularity: "sentence"
  });

  return [...segmenter.segment(text)]
    .slice(0, amount)
    .map((sentence) => sentence.segment.trim());
}

function createArticle(post) {
  const article = document.createElement("section");

  if (post.imageUrl) {
    const image = document.createElement("img");
    image.src = post.imageUrl;
    image.alt = "";
    image.loading = "lazy";
    article.append(image);
  }

  const heading = document.createElement("h3");
  const link = document.createElement("a");

  link.href = post.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = post.title;

  heading.append(link);
  article.append(heading);

  if (post.content) {
    const content = document.createElement("p");
    const sentences = getFirstSentences(post.content, 3);

    sentences.forEach((sentence, index) => {
      content.append(sentence);

      if (index < sentences.length - 1) {
        content.append(document.createElement("br"));
      }
    });

    article.append(content);
  }

  return article;
}

async function initializeDevlog() {
  const devlog = document.querySelector("#Devlog");

  try {
    const [componentResponse, postsResponse] = await Promise.all([
      fetch("medium/devlog.html"),
      fetch("medium/medium-posts.json")
    ]);

    if (!componentResponse.ok || !postsResponse.ok) {
      throw new Error("The dev.log files could not be loaded.");
    }

    devlog.innerHTML = await componentResponse.text();

    const articles = document.querySelector("#Articles");
    const posts = await postsResponse.json();

    // Copy the posts before sorting so the original data remains unchanged.
    const newestPosts = [...posts]
      .sort((first, second) =>
        second.published.localeCompare(first.published)
      )
      .slice(0, 1);

    articles.textContent = "";

    newestPosts.forEach((post) => {
      articles.append(createArticle(post));
    });

    const profile = document.createElement("a");
    profile.href = "https://medium.com/@chrisiscode";
    profile.target = "_blank";
    profile.rel = "noopener noreferrer";
    profile.textContent = "View all on Medium →";
    articles.append(profile);
  } catch (error) {
    devlog.textContent = "The dev.log is temporarily unavailable.";
  }
}

initializeDevlog();

/* !SECTION */
