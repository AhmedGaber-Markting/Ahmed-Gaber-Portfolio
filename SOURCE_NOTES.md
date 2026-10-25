# Ahmed Gaber portfolio — source notes

Personal edition based on the latest VEX portfolio package, version 2 from 24 October 2026. It retains 24 projects, 21 videos, 14 plans and 18 original client social samples, plus the three renamed Meta account reports.

The personal portrait and primary WhatsApp/LinkedIn details come from the user's earlier Ahmed-Gaber-Portfolio.html. The portrait bytes are copied intact. The AG mark is a code-native typographic identifier. The personal presentation uses first-person copy and describes team collaboration rather than claiming sole authorship of every project asset.

Existing client visuals, captions, videos and working documents retain their original identities and context. The removed VEX identity case and VEX-page samples remain excluded. The 8-page Qodoraty PDF and its 8 safe previews retain the prior fee-slide removal.

Meta snapshot: 1 April–22 October 2026, extracted 23 October 2026. Display names are Vex Agency 1, Vex Agency 2, Vex Agency 3; sourceAccountName retains each source name. Metrics, account associations and campaign rows are preserved. Leads and conversation starts can overlap and are not sales or unique customers. Account totals remain the reference; the original Vex account campaign query differs by EGP 0.11 and 5 impressions, disclosed in the interface. Historical platform examples keep their original periods and currencies.

All files required to serve the static website are included. There are no API keys, account sessions or hosting credentials in this package.


GitHub-ready personal update, 24 October 2026: includes the delivered 48-page personal PDF (14,625,233 bytes), restores the missing Qelaa awareness page-two preview from the original PDF, and uses actual strategy pages as gallery covers for the landscape plans. The complete document preview order and sanitized Qodoraty PDF remain intact. A generated content-data.js fallback supports local file viewing and JSON-loading failures; tools/sync-content.py keeps it aligned with content.json. One social display title was shortened to omit a malformed URL; the original caption and source link remain unchanged. Report metrics, project associations, source media and account naming are preserved.

About-photo correction: the about section now uses Ahmed's existing portrait inside the circular frame in place of the AG mark. The source portrait bytes are unchanged; framing uses CSS. The header logo remains the personal AG identifier.

Latest supplied portrait update: the user's 1280x1239 JPEG is now used in both the hero and about sections. Its original bytes are copied to assets/brand/ahmed-gaber-profile-20261024.jpg and embedded into the two visible image elements in index.html so replacing the page is sufficient to display it. The section no longer references the AG mark. No image generation or raster retouching was applied.

Directional Portrait System (Arabic & English):
Dedicated portrait files are maintained in assets/brand/ to guarantee Ahmed Gaber's gaze is always directed inward toward the accompanying headline and content across both languages and sections:
- Hero Section (#home):
  - Arabic (RTL): content on right, card on left -> ahmed-gaber-hero-ar.jpg (gaze directed right towards Arabic text)
  - English (LTR): content on left, card on right -> ahmed-gaber-hero-en.jpg (gaze directed left towards English text)
- About Section (#about):
  - Arabic (RTL): card on right, content on left -> ahmed-gaber-about-ar.jpg (gaze directed left towards Arabic text)
  - English (LTR): card on left, content on right -> ahmed-gaber-about-en.jpg (gaze directed right towards English text)
Initial HTML and runtime language toggling dynamically synchronize both elements with zero layout shift.

Navigation & Actions refinement:
- The redundant static text link "العودة للأعلى ↑" at the bottom of the footer was removed in favor of the persistent, smooth-scrolling floating button (#fab-back-top). The footer layout was balanced with the PDF download action aligned opposite the copyright notice.

Mobile visibility correction:
- Scroll reveal no longer hides pending content. Desktop animation starts from 85% opacity; touch/narrow screens render immediately and do not depend on IntersectionObserver callbacks.
- Mobile pipeline steps use equal-width cards with a two-column icon/text grid; all five labels and descriptions follow the selected language.
- Four Doctor Plus document tables were stored as flat cell arrays, causing `row.map is not a function` on opening the plan. Their rows are restored with 3, 2, 2, and 4 columns respectively, without changing any cell text. The renderer also tolerates unexpected flat rows without aborting the viewer.
- A queued dialog close event cannot clear a newly reopened preview.
- Local asset references resolve, and report data, project associations and original media remain unchanged. Browser layout verification uses Chromium viewport emulation, not physical devices. All 21 original MP4 files were independently probed as H.264 video with AAC audio; the test browser's missing H.264 decoder prevents using it to verify decoded playback.


