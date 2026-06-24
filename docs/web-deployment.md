# Web Deployment

Target public URL:

```text
https://c4-consultant.com/demos/mackaye-fieldbook/
```

FTP destination for the established C4 account:

```text
./demos/mackaye-fieldbook/
```

## Build

```powershell
pnpm install --frozen-lockfile
pnpm export:web
pnpm verify:web-export
pnpm deploy:web -- --dry-run
```

`pnpm export:web` sets Expo’s experimental base URL to `/demos/mackaye-fieldbook`, runs the static Expo export, adds the scoped `.htaccess`, and writes a non-secret marker file. Output is `apps/mobile/dist-web`.

The scoped Apache rules:

- serve real files/directories directly;
- resolve clean routes such as `/guide` to `guide.html`;
- resolve nested static guide routes;
- do not rewrite missing asset requests to HTML;
- use `index.html` only for client-side route fallback inside this demo directory.

## Manual FTP upload

The focused script recursively uploads only `apps/mobile/dist-web`. It does not upload source, tests, `.git`, `.env`, credentials, or repository metadata.

Required shell variables:

```text
FTP_HOST
FTP_USER
FTP_PASSWORD
```

Optional:

```text
FTP_PROTOCOL=ftp
FTP_REMOTE_ROOT=.
```

Credentials are written only to a temporary curl config, are not printed, and are deleted after use.

## Verification

After upload, check the root, five tab routes, one nested guide route, critical JavaScript, artwork, manifest, and marker file. Refresh nested routes and confirm correct MIME types. Browser testing should verify IndexedDB persistence, Stop behavior, simulation, and JSON download.

There is intentionally no automatic production FTP workflow in GitHub Actions.
