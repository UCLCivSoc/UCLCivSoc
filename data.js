/* ==========================================================================
   UCL CIVSOC WEBSITE CONTENT DATA
   Update this file to add News, Events, and Transparency Reports.
   ========================================================================== */

/* --- NEWS POSTS ---
   type options: "social", "career", "academic", "admin"
   ticketStatus options: "On Sale", "Selling Fast", "Limited", "Sold Out"
   eventDate format: "YYYY-MM-DD" (Required for 'Next Event' box)
*/
const posts = [
//POSTS GO HERE

{
id: 1, // Unique ID
date: 'Dec 02, 2025', // Date shown on card
eventDate: '2026-01-16', // OPTIONAL: Countdown
startTime: '19:00', // OPTIONAL: 24hr clock
endTime: '23:00', // OPTIONAL: 24hr clock
title: 'CEGE Awards Dinner x Alumni Event',
type: 'social', // social, career, academic, admin
major: true, // true = Wide Card, false = Small Card
isUltraMajor: true, // true = Full Width Banner (do NOT activate alongside major)
backgroundImage: 'images/cards/awardsdinner.jpg', // Path to image if isUltraMajor = true
hasTickets: true, // Shows ticket button
ticketStatus: 'On Sale', // See valid options on Pg 1
summary: 'Alumni and current students are invited to a three-course dinner and awards ceremony',
content: `
<p>CivSoc is extremely proud to announce this year's major event, organised along side the department, as a way to reunite alumni from CEGE with the current cohorts ! We believe it could become a great way for everyone to meet new faces, network, and overall enjoy a nice, large meal, at a reduced cost !</p>
<img src='images/cards/awardsdinner.jpg'>
<h3>Menu</h3>
<ul>
<li> An appetizer consisting of [...]</li>
<li> A main course adapted to your dietary needs </li>
<li> Exquisite dessert to finish you meal </li>
</ul>
`
},
C
   
];
const reports = [
//MEETING MINUTES
];

const committee = [
//COMMITTEE MEMBERS
];

