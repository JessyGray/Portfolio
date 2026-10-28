/*
  Portfolio data. To add a project, copy one object and edit it.

  id          unique slug, used in the URL (projects.html?project=id)
  category    filters the project belongs to
  summary     one line on the card
  description longer text in the details window
  cover       screenshot path
  live, repo  links (leave empty if there is none)
  featured    true = also shown on the CV page
*/

const PROJECTS = [
    {
        id: 'noir-gloss',
        title: 'Noir Gloss',
        type: 'Detailing studio',
        year: 2026,
        category: ['Web App', 'Next.js'],
        summary: 'Car detailing studio site with online booking and an admin panel.',
        description: 'Bilingual site (Hebrew and English, RTL) for a detailing studio in Tel Aviv. The hero car gets cleaner as you scroll. Eight services with starting prices, a four-step booking form (vehicle, services, date and time, details) with a live price estimate based on vehicle size, WhatsApp confirmation and a studio admin area on Supabase.',
        cover: 'assets/img/projects/noir-gloss.jpg',
        tags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Supabase'],
        live: 'https://noir-gloss.vercel.app',
        repo: 'https://github.com/JessyGray/noir-gloss',
        featured: true
    },
    {
        id: 'izmailovsky-dvorik',
        title: 'Izmailovsky Dvorik',
        type: 'Restaurant',
        year: 2026,
        category: ['Website'],
        summary: 'Website for a restaurant in Moscow: menu, banquets, delivery and cart.',
        description: 'Live site for a restaurant in Moscow. Menu in fifteen categories, a banquet page for events up to 180 guests with a request form, delivery and payment info, a cart, call and WhatsApp buttons, and a light and dark theme.',
        cover: 'assets/img/projects/izdvorik.jpg',
        tags: ['HTML', 'CSS', 'JavaScript'],
        live: 'https://izdvorik.ru',
        repo: '',
        featured: true
    },
    {
        id: 'autoparts-workshop',
        title: 'AutoParts Workshop',
        type: 'Inventory system',
        year: 2026,
        category: ['Web App'],
        summary: 'Stock and sales system for an auto parts workshop, synced to the cloud.',
        description: 'Hebrew RTL web app for a parts workshop. Sales with cart, discounts and several payment methods, parts inventory with categories, shelf locations and low stock alerts, stock counts with CSV export, a movement log and cloud backup and restore. Data syncs between computer and phone through Supabase.',
        cover: 'assets/img/projects/workshop-app.jpg',
        tags: ['JavaScript', 'Supabase', 'PostgreSQL', 'Vercel'],
        live: 'https://auto-parts-workshop.vercel.app',
        repo: 'https://github.com/JessyGray/AutoPartsWorkshop',
        featured: true
    },
    {
        id: 'date-app',
        title: 'Date App',
        type: 'Small side project',
        year: 2026,
        category: ['Side project'],
        summary: 'Invitation page where the "Not now" button runs away from the cursor.',
        description: 'One page invitation. On desktop the "Not now" button escapes the cursor, on mobile it stays put. After "yes" the visitor picks a date, time and place, and the answer is sent to Telegram through the Bot API.',
        cover: 'assets/img/projects/date-app.jpg',
        tags: ['HTML', 'CSS', 'JavaScript', 'Telegram Bot API'],
        live: '',
        repo: 'https://github.com/JessyGray/DateApp',
        featured: false
    }
];
