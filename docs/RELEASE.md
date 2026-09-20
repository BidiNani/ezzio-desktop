# Procédure de Release et Signature Auto-Updater

## Gestion des Clés
- Clé privée : ~/.tauri/ezzio.key (JAMAIS commitée)
- Clé publique : dans src-tauri/tauri.conf.json sous plugins.updater.pubkey

## GitHub Secrets
- TAURI_SIGNING_PRIVATE_KEY : contenu de ~/.tauri/ezzio.key
- TAURI_SIGNING_PRIVATE_KEY_PASSWORD : mot de passe (vide si aucun)

## Déclenchement
Sur tag Git * : build + signature automatique via GitHub Actions Tauri.
