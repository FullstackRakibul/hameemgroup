# Ha-Meem Group - Corporate Landing Page

This project is a modern, high-performance corporate landing page for the **Ha-Meem Group**, a leading wholesale clothing manufacturer based in Bangladesh.

## 🚀 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 8
- **Language**: TypeScript (TSX)
- **Styling**: Tailwind CSS v4 combined with Vanilla CSS (`src/index.css`) for fine-grained control and design aesthetics.
- **Animations**: GSAP (GreenSock Animation Platform) + MotionPathPlugin

## 📁 Project Structure

- `index.html`: The main HTML shell. It contains comprehensive, customized SEO metadata, OpenGraph tags, and JSON-LD structured data tailored explicitly for the Ha-Meem Group.
- `vite.config.ts`: A clean, standard Vite configuration file optimized for React and Tailwind CSS.
- `src/main.tsx`: The React entry point that imports the global styles and mounts the application.
- `src/App.tsx`: The primary application layout. Contains the landing page sections (Hero, Company Info, Businesses, Products, News, Careers) and coordinates the preloader logic.
- `src/Preloader.tsx`: A custom, GSAP-powered SVG animation that displays smoothly while the main page is loading.
- `src/index.css`: The global CSS file housing core styling resets, Tailwind imports, and custom utility classes and typography definitions (using Google Fonts like Fira Sans Condensed).

## ✨ Key Features

1. **Rich Design Aesthetics**: Uses high-quality images, modern typography, and a dark/light contrast theme to deliver a premium user experience.
2. **Custom GSAP Preloader**: An animated SVG preloader smoothly traces a path using GSAP's `MotionPathPlugin` before gracefully fading into the main content.
3. **Optimized SEO**: Hardcoded, tailored meta tags ensure high visibility and rich snippets when shared on social media, including an extensive structured data payload outlining the company's size, founders, and contact methods.
4. **Interactive Sections**: Dynamic product browsing and animated step-by-step supply chain breakdowns.

## 💻 Development Commands

The project comes with standard Vite development scripts.

- **Start Development Server**: 
  ```bash
  npm run dev
  ```
- **Build for Production**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```

## 📝 Recent Updates
- Converted a custom Vue.js SVG preloader into a React/TSX component using GSAP.
- Stripped away legacy AI/Figma-Make integrations from the Vite config to keep the build process lean and standard.
- Embedded Ha-Meem Group's complete corporate profile (history, founders, and contact lists) natively into `index.html` for maximum SEO impact.
