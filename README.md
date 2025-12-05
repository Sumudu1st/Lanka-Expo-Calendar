<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/10GwSv4WcQXBxavWj1uqJhSxmg0Yzn8Mg

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

The app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

To manually deploy:
1. Install dependencies:
   `npm install`
2. Build the app:
   `npm run build`
3. The build output will be in the `dist` folder, ready for deployment.

The GitHub Actions workflow will automatically deploy the built app to GitHub Pages.

