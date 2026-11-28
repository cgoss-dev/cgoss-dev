/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: CERTIFICATE QUEUE */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function createCertificateProgress(certificate) {
  const { chapters } = certificate;
  const block = document.createElement("section");
  const segments = document.createElement("div");

  segments.className = "progress-segments";

  chapters.forEach((chapter) => {
    const segment = document.createElement("div");
    const progress = document.createElement("progress");
    const count = document.createElement("small");

    segment.className = "progress-chapter";
    segment.style.flexGrow = chapter.totalLessons;
    progress.value = chapter.completedLessons;
    progress.max = chapter.totalLessons;
    progress.setAttribute(
      "aria-label",
      `Chapter ${chapter.chapter}: ${chapter.completedLessons} of ${chapter.totalLessons} lessons completed`
    );
    progress.textContent = `${chapter.completedLessons} of ${chapter.totalLessons}`;
    count.textContent = `${chapter.completedLessons}/${chapter.totalLessons}`;
    count.setAttribute("aria-hidden", "true");

    segment.append(progress, count);
    segments.append(segment);
  });

  block.append(segments);
  return block;
}

function createCertificateCard(certificate) {
  const section = document.createElement("section");
  section.className = "certificate";
  const heading = document.createElement("a");
  heading.href = certificate.url;
  heading.target = "_blank";
  heading.rel = "noopener noreferrer";
  const icon = document.createElement("i");
  icon.className = certificate.icon || "fa-solid fa-book-open";
  icon.setAttribute("aria-hidden", "true");
  heading.append(icon, " ", certificate.course);

  section.append(
    heading,
    createCertificateProgress(certificate)
  );

  return section;
}

async function initializeCertificateQueue() {
  const activity = document.querySelector("#CertificateQueue");
  const root = document.body.dataset.root;

  try {
    const activityResponse = await fetch(`${root}/learning/activity.json`);

    if (!activityResponse.ok) {
      throw new Error("Certificate activity could not be loaded.");
    }

    const data = await activityResponse.json();

    activity.textContent = "";

    data.certificates.forEach((certificate) => {
      activity.append(createCertificateCard(certificate));
    });

  } catch (error) {
    activity.textContent = "Certificate activity is temporarily unavailable.";
  }
}

initializeCertificateQueue();

/* !SECTION */
