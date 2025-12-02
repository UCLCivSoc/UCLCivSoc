# 🏛️ UCL CivSoc Website - Maintenance Guide 🛠️

Welcome to the CivSoc website codebase. This is a **static site**, meaning it requires no servers, no database, and no complex setup.

## 📂 File Structure

This is how the project is organized. You will mainly be working in **`data.js`**.

* **`index.html`** → The Homepage (News Feed). **(Edit footer here for sponsors)**
* **`admin.html`** → The Committee Admin Console (Protected by a password).
* **`data.js`** → **THE DATABASE.** This is the *only* file you usually need to edit.
* **`script.js`** → The logic (animations, calendar links).
* **`style.css`** → The colors, fonts, and layout rules.
* **`images/`**
    * `website/` → Logos and icons (CivSoc logo, SU logo).
    * `cards/` → Photos for your news posts.
    * `sponsorlogos/` → Logos of your financial partners.

-------------------------------------

## Key info:

* An admin panel is available is you type A D M I N on your keyboard - password is civsoc2025
* There are a few easter eggs:
    * If you press the civsoc logo five times quickly it opens up a procedural 3D model of a bridge
    * If you type ↑ ↑ ↓ ↓ ← → ← → B A, you enter "duck mode"
    * If you type P L A N (or) C A D, you get a blueprint version of the website
    * If you destroy both columns on the homepage footer, something happens (secret)
    * If you type G A M E, it opens a brick blaster game (very cool)

-------------------------------------

## General Information on how to write a document on this website (what you generally need to know, when writing text):

<p></p> creates a generic paragraph between the two boundaries
<img> creates an image (use template to see how it should be arranged to work correctly)
<h3></h3> creates a sub title (bigger, bolder text) between the two boundaries
<ul></ul> creates a list
<li></li> adds an INDIVIDUAL element to the list (must be included between the ul boundaries)

---

## ⚡ How to Update Content (data.js)

All primary content (News, Events, Reports) is managed inside **`data.js`**. Open this file in a text editor.

### 1. Adding a New Event / News Post

Scroll to the `const posts = [...]` list. Paste this block at the **top** of the list:

```javascript
{
    id: 102,  // CHANGE THIS: Must be a unique number (e.g. 102, 103)
    date: "Dec 05, 2025", // Date displayed on the card (when it was added)
    
    // OPTIONAL: EVENT DETAILS
    eventDate: "2025-12-25", // ACTUAL EVENT DATE (Format: YYYY-MM-DD)
    startTime: "19:00",      // 24-hour clock (Used for calendar deep links, e.g., 7 PM)
    endTime: "23:00",        // 24-hour clock
    
    title: "Christmas Dinner", 
    type: "social", // Choose one: "social", "career", "academic", "admin"
    major: true,    // true = Big Wide Card (Highlights Event)
    
    // TICKET SETTINGS
    hasTickets: true, // true = Shows button and ticket ticker
    ticketStatus: "Selling Fast", // Options: "On Sale", "Selling Fast", "Sold Out"
    
    summary: "Short description shown on the homepage card.",
    
    // FULL ARTICLE CONTENT
    content: `
        <p>This is the main text of your article. Use <p></p> for paragraphs.</p>
        <img src="images/cards/christmas.jpg" alt="Dinner">
        <h3>Menu</h3>
        <ul>
            <li>Turkey</li>
            <li>Vegan Nut Roast</li>
        </ul>
    `
},


```
--------------------------

### 2. Glass Reports (Weekly Reports)

To add a Glass (weekly) report you must add this block at the top of the related field (also present in data.js, after 'const reports = [...]'):

```javascript

{
        id: "week11", // Must be unique ID (e.g., week11)
        label: "Week 11 (Dec 08 - 14)", // Title shown on the report sidebar
        stats: { 
            attendance: "12/14",      // Members Present (e.g., 12 out of 14)
            spent: "£50.00",           // Total gross spending this week
            discussion: "4",           // Number of distinct agenda items
            decisions: "2"             // Number of decisions formally passed
        },
        finances: [
            // List all money spent (-) or earned (+) this week
            // Leave array empty [] if no money was spent.
            { item: "Pizza", category: "Social", amount: "-£50.00", type: "negative" },
            { item: "Sponsor Payment", category: "Income", amount: "+£200.00", type: "positive" }
        ],
        minutes: [
            "Formal minutes line 1.",
            "Formal minutes line 2 (Summary of discussion)." //keep this format with "[content]" with individual elements of the minutes on their own line
        ]
    },

```

--------------------------

### 3. Sponsorships

To add more sponsors (or remove them) from the footer simply add the following block in the [<footer> </footer>] section in index.html, report.html, committee.html individually (i know, i know)

```javascript

<div class="sponsor-grid">
    <img src="images/sponsorlogos/new-sponsor.png" alt="New Sponsor Name" class="sponsor-img">
    </div>


MAKE SURE THAT YOU HAVE PUT THEIR LOGO IN images/sponsorlogos/[specificlogo].png to make it work !!
THE LOGO SHOULD NOT HAVE A BACKGROUND (use websites like remove.bg for that if needed) be careful doing these manipulations as you will be directly interacting with the structure of the website (I know, bad design)