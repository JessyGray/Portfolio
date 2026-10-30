# Jessy Gray: CV and projects

Personal CV site with a projects page. Plain HTML, CSS and JavaScript, no build step.
Open `index.html` in a browser.

## Files

```
index.html           CV
projects.html        projects with filter, search and details window
css/
  base.css           colors, fonts, reset
  layout.css         container, header, menu, footer
  components.css     buttons, tags, project cards
  home.css           CV page and print styles
  projects.css       projects page
js/
  main.js            theme, smooth scroll, menu
  projects.js        builds the project cards from data/projects.js
  motion.js          scroll animations (GSAP)
data/projects.js     project list
assets/              favicon and screenshots
```

## Adding a project

1. Save a screenshot to `assets/img/projects/` (about 1440px wide, `.jpg`).
2. Add an object to `PROJECTS` in `data/projects.js`:

```js
{
    id: 'weather-app',
    title: 'Weather App',
    type: 'Side project',
    year: 2027,
    category: ['Web App'],
    summary: 'One line for the card.',
    problem: 'What the client needed and how the project solves it.',
    role: 'What I did: design, frontend, database, deploy.',
    cover: 'assets/img/projects/weather-app.jpg',
    tags: ['JavaScript', 'Fetch API'],
    live: 'https://example.vercel.app',
    repo: 'https://github.com/JessyGray/weather-app',
    featured: false
}
```

New categories show up in the filter automatically. `featured: true` puts the project on the CV page (first three).

## PDF

The "Download CV" button opens the print dialog. Choose "Save as PDF". Navigation, projects and buttons are hidden in print.

## Libraries

GSAP (ScrollTrigger, Flip) and Lenis, loaded from a CDN. Without them the site still works, just without animation.
