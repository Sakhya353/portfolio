# Sakhya Sharma — Portfolio

Static portfolio website. No build step, no installs.

## Folder structure
```
Sakhya-Sharma-Portfolio/
├── index.html                      Main portfolio page
├── css/style.css                   All site styles
├── js/main.js                      Animations, research lab, search, theme
├── assets/documents/
│   ├── Sakhya-Sharma-CV.pdf
│   └── Sakhya-Sharma-Research-Project-Report.pdf
│   ├── index.html
│   ├── style.css
│   └── app.js
├── vercel.json
├── netlify.toml
└── README.md
```

## Run locally (VS Code)
1. Unzip, then File → Open Folder → `Sakhya-Sharma-Portfolio`.
2. Install the **Live Server** extension.
3. Right-click `index.html` → **Open with Live Server** (or just double-click `index.html`).

## Deploy
- **Netlify:** drag the whole folder onto app.netlify.com/drop.
- **Vercel:** Import the folder/repo, framework preset "Other", no build command.
- **GitHub Pages:** push to a repo, Settings → Pages → deploy from `main` / root.

## Update content
- CV / report: replace the PDFs in `assets/documents/` (keep the file names).
- Text, links, CGPA: edit `index.html`.
- Colors / layout: edit `css/style.css`.
- Behaviour: edit `js/main.js`.
