// Excerpt from src/theme/Root.js

const sleepingFaviconUrl = useBaseUrl('/img/favicon-sleeping.png');

// Title bar easter egg: greet visitors who leave the tab and come back,
// swapping the favicon for a dozing meerkat while they're away.
useEffect(() => {
  const originalTitle = document.title;
  const faviconLink = document.querySelector('link[rel="icon"]');
  const originalFavicon = faviconLink?.href;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      document.title = 'Come back, the meerkat is on watch! \u{1F440}';
      if (faviconLink) faviconLink.href = sleepingFaviconUrl;
    } else {
      document.title = originalTitle;
      if (faviconLink && originalFavicon) faviconLink.href = originalFavicon;
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () =>
    document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [location, sleepingFaviconUrl]);
