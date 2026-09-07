# E-zzio Desktop - base corrigee

Ce projet part de la spec generee par DeepSeek, avec les corrections suivantes.

## Ce qui a ete corrige

1. **tauri.conf.json et capabilities/** - reecrits en syntaxe Tauri v2.
   La version DeepSeek utilisait le systeme "allowlist" de Tauri v1,
   supprime depuis la sortie stable de Tauri 2. Le fichier original
   n'aurait tout simplement pas fonctionne.

2. **Lancement du backend FastAPI** - deplace cote Rust (src-tauri/src/lib.rs),
   au demarrage de l'app, avec arret propre a la fermeture. Ca evite
   d'avoir a configurer des permissions webview pour executer un
   process externe - le Rust n'est pas soumis au systeme de capabilities
   qui ne s'applique qu'au frontend.
   A FAIRE : remplacer `Command::new("python")` par le chemin reel
   de ton environnement Python E-zzio.

3. **Bug de hover corrige** - la version DeepSeek mettait des cles
   `:hover` dans des objets de style inline React, ce qui ne fonctionne
   jamais (les objets JS n'ont pas de pseudo-selecteurs). Le hover est
   maintenant une vraie classe CSS (`.card-interactive` dans tokens.css).

4. **Plus d'emojis comme icones** - remplaces par lucide-react
   (bibliotheque d'icones vectorielles gratuite, meme esprit que les
   icones outline utilisees dans les maquettes).

5. **Theme clair/sombre reellement fonctionnel** - la spec promettait
   un toggle clair/sombre dans Reglages mais ne livrait que des
   couleurs sombres en dur. tokens.css definit maintenant les deux
   themes via `[data-theme]`, et App.tsx a un vrai toggle qui persiste
   le choix.

6. **Navigation reellement branchee** - dans la version DeepSeek,
   les boutons de nav mobile n'avaient aucun onClick et le Dashboard
   etait affiche en dur. App.tsx gere maintenant un vrai etat de tab
   avec Sidebar (desktop) et BottomNav (mobile) fonctionnels.

7. **Hook SSE ajoute** (useMissionEvents.ts) en plus du polling -
   si le backend expose vraiment du streaming SSE comme le suggere
   le rapport d'architecture E-zzio, c'est la bonne base pour du
   temps reel plutot qu'un ping toutes les 15s.

## CE QUI RESTE A VERIFIER AVANT D'ALLER PLUS LOIN

Les endpoints (/missions, /goals, /approvals, /health, /ping) et le
shape exact des objets JSON sont des HYPOTHESES de nommage REST
classique. Rien de tout ca n'a ete verifie contre le vrai backend
E-zzio (core/main.py ou web_server.py). Avant de brancher les ecrans
sur useEzzioApi, il faut confirmer :
- les routes reelles exposees par le backend
- le format exact des reponses JSON (noms de champs, types)
- s'il existe deja un endpoint de streaming (SSE/WebSocket) pour
  les mises a jour de mission en temps reel
- les permissions Tauri exactes necessaires si finalement le
  frontend (pas le Rust) doit executer des commandes shell -
  la doc officielle a jour est https://v2.tauri.app/reference/acl/

## Demarrage

```bash
npm install
npm run tauri dev
```

Necessite Node 20+, Rust (rustup), et le backend E-zzio lance
separement en dev (ou laisse le process Rust le demarrer).
