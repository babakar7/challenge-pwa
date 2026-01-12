import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page.
 * It's used to add PWA manifest, service worker registration, and meta tags.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#7C547D" />
        <meta
          name="description"
          content="Track your 28-day wellness challenge with daily habits, meal planning, and progress tracking."
        />

        {/* iOS PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Revive" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.png" />

        <title>Revive Challenge</title>

        {/* Disable body scrolling on web to match native behavior */}
        <ScrollViewStyleReset />

        {/* Background color for the app */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #FBF6F0;
          }
        `}} />

        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                  console.log('ServiceWorker registration successful');
                })
                .catch(function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
            });
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
