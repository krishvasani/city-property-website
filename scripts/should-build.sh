#!/usr/bin/env bash
# Netlify "ignore" command — decides whether a build should run.
#   exit 0  => skip the build (do not deploy)
#   exit 1  => run the build (deploy)
#
# We only build when the deploy was started by the CMS "Go live" button, which
# triggers a Netlify build hook (Netlify sets INCOMING_HOOK_* for those). This
# lets employees save as many property and blog edits as they like without
# deploying; the site goes live only when they click Publish.
if [ -n "$INCOMING_HOOK_TITLE" ] || [ -n "$INCOMING_HOOK_URL" ] || [ -n "$INCOMING_HOOK_BODY" ]; then
  echo "Publish hook detected — building and deploying the latest content."
  exit 1
fi
echo "No publish hook — skipping build. Edits are saved in Git; click 'Go live' in /cps-admin to publish them."
exit 0
