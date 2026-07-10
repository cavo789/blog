// Excerpt from src/theme/Root.js

// Console easter egg: a little wink for visitors who open DevTools.
// Runs once per full page load, not on every client-side route change.
useEffect(() => {
  console.log(
    '%c \u{1F9AB} Curious, aren\'t you?',
    'font-size:18px;font-weight:bold;color:#e8871e;',
  );
  console.log(
    '%cThe meerkat sentry is watching this site too. If you enjoy digging around in the source, try the Konami code somewhere on this page...',
    'font-size:12px;color:#888;',
  );
}, []);
