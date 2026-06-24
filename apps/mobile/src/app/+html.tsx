import type { PropsWithChildren } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

const canonical = "https://c4-consultant.com/demos/mackaye-fieldbook/";
const description =
  "Independent offline-first field-guide and hiking-journal prototype with fictional demonstration content.";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />
        <title>MacKaye Fieldbook — Offline-first hiking guide prototype</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#285B3C" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={canonical} />
        <link rel="manifest" href="/demos/mackaye-fieldbook/manifest.json" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content="MacKaye Fieldbook" />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${canonical}icon-512.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MacKaye Fieldbook" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${canonical}icon-512.png`} />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *:focus-visible { outline: 3px solid #e0b86d !important; outline-offset: 3px; }
              html { scroll-behavior: smooth; }
              body { margin: 0; }
              @media (prefers-reduced-motion: reduce) {
                html { scroll-behavior: auto; }
                *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
