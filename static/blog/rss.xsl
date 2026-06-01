<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">

  <xsl:output method="html" version="1.0" encoding="utf-8" indent="yes"/>

  <!-- ── Root ── -->
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS Feed</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --green:      #2e8555;
            --green-mid:  #3cad6e;
            --green-pale: #e8f7ef;
            --text:       #1c1e21;
            --muted:      #6b7280;
            --border:     #e5e7eb;
            --bg:         #f9fafb;
            --white:      #ffffff;
            --radius:     10px;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --text:   #e3e3e3;
              --muted:  #9ca3af;
              --border: #374151;
              --bg:     #111827;
              --white:  #1f2937;
              --green-pale: rgba(60,173,110,0.12);
            }
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            font-size: 16px;
          }

          /* ── Banner ── */
          .banner {
            background: linear-gradient(135deg, #1a4731 0%, var(--green) 60%, var(--green-mid) 100%);
            color: white;
            padding: 2.5rem 1.5rem 2rem;
          }
          .banner-inner {
            max-width: 760px;
            margin: 0 auto;
          }
          .rss-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 999px;
            padding: 0.2rem 0.75rem;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 1rem;
          }
          .rss-pill svg { width: 14px; height: 14px; fill: #f97316; }
          h1 {
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            color: white;
            margin-bottom: 0.4rem;
          }
          .desc {
            font-size: 0.95rem;
            opacity: 0.8;
            margin-bottom: 1.25rem;
          }
          .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            font-size: 0.8rem;
            opacity: 0.7;
          }
          .meta a { color: white; text-decoration: underline; }

          /* ── Subscribe hint ── */
          .hint {
            max-width: 760px;
            margin: 1.25rem auto;
            padding: 0 1.5rem;
          }
          .hint-box {
            background: var(--green-pale);
            border: 1px solid var(--green-mid);
            border-radius: var(--radius);
            padding: 0.85rem 1.1rem;
            font-size: 0.85rem;
            color: var(--text);
            display: flex;
            gap: 0.6rem;
            align-items: flex-start;
          }
          .hint-box strong { color: var(--green); }

          /* ── Items ── */
          .items {
            max-width: 760px;
            margin: 0 auto 3rem;
            padding: 0 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .item {
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 1.25rem 1.4rem;
            transition: border-color .2s, box-shadow .2s;
          }
          .item:hover {
            border-color: var(--green);
            box-shadow: 0 4px 16px rgba(46,133,85,.1);
          }

          .item-date {
            font-size: 0.75rem;
            color: var(--muted);
            margin-bottom: 0.4rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .item-date::before {
            content: "";
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--green-mid);
            flex-shrink: 0;
          }

          .item-title {
            font-size: 1.05rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            line-height: 1.3;
          }
          .item-title a {
            color: var(--text);
            text-decoration: none;
          }
          .item-title a:hover { color: var(--green); text-decoration: underline; }

          .item-desc {
            font-size: 0.875rem;
            color: var(--muted);
            line-height: 1.55;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .item-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3rem;
            margin-top: 0.75rem;
          }
          .tag {
            font-size: 0.68rem;
            padding: 0.15rem 0.55rem;
            background: var(--green-pale);
            color: var(--green);
            border: 1px solid rgba(46,133,85,.25);
            border-radius: 999px;
            font-weight: 600;
            letter-spacing: 0.03em;
          }

          .item-author {
            font-size: 0.75rem;
            color: var(--muted);
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid var(--border);
          }

          /* ── Footer ── */
          footer {
            text-align: center;
            padding: 1.5rem;
            font-size: 0.78rem;
            color: var(--muted);
            border-top: 1px solid var(--border);
          }
          footer a { color: var(--green); }
        </style>
      </head>

      <body>
        <!-- Banner -->
        <div class="banner">
          <div class="banner-inner">
            <div class="rss-pill">
              <!-- RSS icon -->
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
              </svg>
              RSS Feed
            </div>
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="desc"><xsl:value-of select="/rss/channel/description"/></p>
            <div class="meta">
              <span>
                <xsl:value-of select="count(/rss/channel/item)"/> article(s)
              </span>
              <span>&#8231;</span>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="/rss/channel/link"/>
                </xsl:attribute>
                Visit the blog ↗
              </a>
            </div>
          </div>
        </div>

        <!-- Hint -->
        <div class="hint">
          <div class="hint-box">
            <span>ℹ️</span>
            <span>
              This is an <strong>RSS feed</strong>. To subscribe, copy this page's URL into your
              feed reader (Feedly, NetNewsWire, Reeder…).
            </span>
          </div>
        </div>

        <!-- Articles -->
        <div class="items">
          <xsl:apply-templates select="/rss/channel/item"/>
        </div>

        <footer>
          Feed generated by
          <a href="{/rss/channel/link}"><xsl:value-of select="/rss/channel/title"/></a>
          &#8231;
          <a href="https://validator.w3.org/feed/check.cgi?url={/rss/channel/link}/rss.xml">
            Validate feed ↗
          </a>
        </footer>
      </body>
    </html>
  </xsl:template>

  <!-- ── Item template ── -->
  <xsl:template match="item">
    <div class="item">
      <div class="item-date">
        <xsl:value-of select="pubDate"/>
      </div>
      <div class="item-title">
        <a target="_blank" rel="noopener noreferrer">
          <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
          <xsl:value-of select="title"/>
        </a>
      </div>
      <!-- Plain-text description (strip any HTML that might slip through) -->
      <xsl:if test="description != ''">
        <div class="item-desc">
          <xsl:value-of select="description"/>
        </div>
      </xsl:if>
      <!-- Categories / tags -->
      <xsl:if test="category">
        <div class="item-tags">
          <xsl:for-each select="category">
            <span class="tag"><xsl:value-of select="."/></span>
          </xsl:for-each>
        </div>
      </xsl:if>
      <!-- Author -->
      <xsl:if test="author or dc:creator">
        <div class="item-author">
          By <xsl:value-of select="author|dc:creator"/>
        </div>
      </xsl:if>
    </div>
  </xsl:template>

</xsl:stylesheet>
