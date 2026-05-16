<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e8bdb9a7-7e5c-46f3-9846-9da828f5cab8
GitHub Pages: https://cspgabriel.github.io/app-m-dico-gratuito-felipe-ipad/

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

The repository now includes the workflow `.github/workflows/deploy-pages.yml`.
After enabling **Settings → Pages → Build and deployment → Source: GitHub Actions**, every push to `main` deploys to:

`https://cspgabriel.github.io/app-m-dico-gratuito-felipe-ipad/`
