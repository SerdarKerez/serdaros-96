/* SerdarOS 96 — personal content (English). Same shape, ids and order as lib/content.ts. */
import { CONTENT, type Content } from "./content";

const [anket, genomik, veri] = CONTENT.projects;
const [p0, p1, p2, p3, p4, p5] = CONTENT.photos;

export const CONTENT_EN: Content = {
  owner: {
    ...CONTENT.owner,
    tagline: "Computer Programming student · on the road to Data Engineering",
    location: "Antalya / Trabzon, Türkiye"
  },

  desktopIcons: [...CONTENT.desktopIcons],
  startMenu: [...CONTENT.startMenu],

  files: {
    about: {
      title: "About Me.txt",
      text:
`Hi, I'm Serdar Kerez.

I study Computer Programming (associate degree) at Akdeniz University.
My goal is to specialize in Data Engineering: collecting data,
cleaning it, moving it around and turning it into something meaningful.

--- Languages ---
Python, C#, Delphi (Object Pascal), JavaScript, SQL (MSSQL)

--- Tools ---
VS Code, PyCharm, Delphi 7, SSMS, Photoshop, Adobe Animate

--- Generative AI & media ---
I produce UGC ads, synthetic characters and instrumental audio.
I use Magnific AI, Freepik AI, Seedance and Kling, and edit in CapCut.

--- Free time ---
I play electric guitar (D Standard). I listen to Metallica, Gojira, Pantera,
Rammstein, 2L8, Fairuz, Erkan Oğur and Eric Clapton.
I read sci-fi, dystopias and comics: Watchmen, Foundation,
The Island of Doctor Moreau, C. M. Kösemen.

Welcome to SerdarOS 96. Feel free to poke around!`
    },
    welcome: {
      title: "Welcome.txt",
      text:
`SerdarOS 96 — Personal Edition

This site is my personal portfolio, reimagined as a late-'90s
desktop operating system.

How to use it:
 • Double-click the desktop icons.
 • Drag windows by their title bar, resize them from the corners.
 • Explore the "start" menu in the bottom-left corner.
 • Right-click the desktop.
 • The Games folder has a few small games.
 • Open the Blog icon to read my posts.

Have fun!  — Serdar`
    },
    copyright: {
      title: "Copyright.txt",
      text: `© ${new Date().getFullYear()} Serdar Kerez. All rights reserved.\nSerdarOS 96 is an imaginary operating system.`
    },
    privacy: {
      title: "Privacy.txt",
      text: `This site uses no cookies. Your notes and settings are stored only in your browser's localStorage.`
    }
  },

  projects: [
    {
      ...anket,
      name: "Survey Portal",
      desc: "An online portal for building surveys and collecting responses."
    },
    {
      ...genomik,
      name: "Genomic CRM",
      desc: "Concept for a genomic CRM platform that analyzes raw DNA data."
    },
    {
      ...veri,
      name: "Data Science Projects",
      desc: "Data science work on GitHub from the Systems Analysis and Design I course."
    }
  ],

  folders: {
    computer: { ...CONTENT.folders.computer, title: "My Computer", items: [...CONTENT.folders.computer.items] },
    games:    { ...CONTENT.folders.games, title: "Games", items: [...CONTENT.folders.games.items] },
    recycle:  { title: "Recycle Bin", items: [], empty: "The Recycle Bin is empty." }
  },

  photos: [
    { ...p0, caption: "A view of Budapest" },
    { ...p1, caption: "Inside a Baroque church" },
    { ...p2, caption: "After a workout" },
    { ...p3, caption: "With friends" },
    { ...p4, caption: "On the road, in the car" },
    { ...p5, caption: "Hedgehog in the leaves" }
  ],

  avatars: [...CONTENT.avatars]
};
