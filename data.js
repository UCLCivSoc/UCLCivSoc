/* ==========================================================================
   UCL CIVSOC WEBSITE CONTENT DATA
   Update this file to add News, Events, and Transparency Reports.
   ========================================================================== */

/* --- NEWS POSTS ---
   type options: "social", "career", "academic", "admin"
   ticketStatus options: "On Sale", "Selling Fast", "Limited", "Sold Out"
   eventDate format: "YYYY-MM-DD" (Required for 'Next Event' box)
   
   NEW: isUltraMajor: true (Spans full width, image on right)
   NEW: backgroundImage: "path/to/image.jpg" (Required for Ultra Major cards)
*/
const posts = [
    {
        id: 1, 
        date: "Nov 28, 2025", 
        eventDate: "2025-12-15",
        startTime: "19:00", 
        endTime: "23:59",
        
        title: "The Winter Ball 2025", 
        type: "social", 
        major: true,
        isUltraMajor: true,
        backgroundImage: "images/cards/winterball.jpg",
        
        hasTickets: true, 
        ticketStatus: "Sold Out",
        summary: "The highlight of the year. Grand Connaught Rooms. Black Tie.",
        content: `
            <p class="lead">We are pleased to announce that the Winter Ball has reached full capacity.</p>
            <img src="images/cards/winterball.jpg" alt="Ballroom">
            <p>Due to the high demand, we released a secondary batch of 20 tickets yesterday which were claimed within minutes.</p>
            <h3>Financial Breakdown</h3>
            <ul>
                <li><strong>Venue Hire:</strong> 40% of ticket price</li>
                <li><strong>Catering:</strong> 35% of ticket price</li>
                <li><strong>Subsidy:</strong> 10% from society funds</li>
            </ul>
        `
    },
    {
        id: 2, 
        date: "Nov 24, 2025", 
        eventDate: "2025-11-20", 
        startTime: "14:00",
        endTime: "16:00",
        
        title: "HS2 Old Oak Common", 
        type: "career", 
        major: false, 
        hasTickets: false,
        summary: "Piling works and excavation observation report.",
        content: `
            <p>30 members visited the HS2 site.</p>
            <img src="images/cards/sitevisit.jpg" alt="Site Visit">
            <p>We observed the main box excavation and learned about the 'top-down' construction method.</p>
        `
    },
   {
        id: 5, 
        date: "Dec 01, 2025", 
        eventDate: "2026-01-20", 
        startTime: "13:00",
        endTime: "17:00",
        title: "Office Tour: Mott MacDonald", 
        type: "career", 
        major: true, 
        hasTickets: true, 
        ticketStatus: "Selling Fast",
        summary: "Exclusive office tour and networking session with the structures team.",
        content: `...`
    },
    // --- 4. ADMIN (News Only) ---
    {
        id: 3, 
        date: "Nov 21, 2025", 
        eventDate: null, 
        title: "Budget Approval", 
        type: "admin", 
        major: false, 
        hasTickets: false,
        summary: "The 2025 Semester 1 Budget has been ratified.",
        content: `
            <p>The budget was approved with a 9-0 vote.</p>
            <p>Key allocations include increased funding for the Concrete Canoe competition and the Design Challenge.</p>
        `
    },
    // --- 5. NEW: PANEL DISCUSSION (Academic, On Sale) ---
    {
        id: 6, 
        date: "Dec 02, 2025", 
        eventDate: "2025-12-10", 
        title: "Panel: The Climate Crisis", 
        type: "academic", 
        major: false, 
        hasTickets: true, 
        ticketStatus: "On Sale",
        summary: "Join professors from the department to discuss sustainable retrofit.",
        content: `
            <p>A deep dive into how Civil Engineers can mitigate carbon impact.</p>
            <img src="https://placehold.co/800x400/500778/FFFFFF?text=Panel+Discussion" alt="Panel">
            <p>Pizza and drinks provided afterwards in the common room.</p>
        `
    },
    // --- 6. EXISTING: GUEST LECTURE ---
    {
        id: 4, 
        date: "Nov 14, 2025", 
        eventDate: "2025-12-05", 
        title: "Guest Lecture: Arup", 
        type: "academic", 
        major: false, 
        hasTickets: true, 
        ticketStatus: "Limited",
        summary: "Dr. Chen discussed the future of sustainable concrete.",
        content: `
            <p>Full lecture slides are available on Moodle.</p>
            <img src="https://placehold.co/800x400/500778/FFFFFF?text=Slides" alt="Lecture">
            <p>Dr. Chen highlighted that the industry is moving rapidly towards calcined clay cements.</p>
        `
    },
    // --- 7. NEW: PUB SOCIAL (Social, On Sale) ---
    {
        id: 7, 
        date: "Dec 03, 2025", 
        eventDate: "2025-12-18", 
        title: "End of Term Pub Social", 
        type: "social", 
        major: false, 
        hasTickets: true, 
        ticketStatus: "On Sale",
        summary: "Celebrate the end of deadlines at the Phineas Bar.",
        content: `
            <p>First round is on CivSoc!</p>
            <img src="https://placehold.co/800x400/D61A68/FFFFFF?text=Pub+Social" alt="Pub">
            <p>Wear your ugliest Christmas Jumper to win a prize.</p>
        `
    },
    // --- 8. NEW: CV WORKSHOP (Career) ---
    {
        id: 8, 
        date: "Nov 10, 2025", 
        eventDate: "2026-01-15", 
        title: "CV & Cover Letter Workshop", 
        type: "career", 
        major: false, 
        hasTickets: false,
        summary: "Get your applications ready for summer internships.",
        content: `
            <p>Hosted by the UCL Engineering Careers team.</p>
            <p>Bring a printed copy of your CV for live feedback.</p>
        `
    },
    // --- 9. NEW: CONCRETE CANOE (Academic/Social) ---
    {
        id: 9, 
        date: "Oct 25, 2025", 
        eventDate: null, 
        title: "Concrete Canoe Team", 
        type: "academic", 
        major: true, 
        hasTickets: false,
        summary: "Recruitment for the 2026 Racing Team is now open.",
        content: `
            <p>We are looking for 5 first-year students to join the casting team.</p>
            <img src="https://placehold.co/800x400/500778/FFFFFF?text=Canoe+Team" alt="Canoe">
            <p>No previous experience required, just enthusiasm for concrete!</p>
        `
    },
    // --- 10. NEW: EGM VOTE (Admin) ---
    {
        id: 10, 
        date: "Dec 05, 2025", 
        eventDate: "2026-01-10", 
        title: "EGM: Constitution Vote", 
        type: "admin", 
        major: false, 
        hasTickets: false,
        summary: "Extraordinary General Meeting to vote on amendment 4.2.",
        content: `
            <p>Please review the attached PDF in your emails.</p>
            <p>This vote concerns the addition of a 'Sustainability Officer' to the committee.</p>
        `
    }
];

/* --- TRANSPARENCY REPORTS ---
   Leave finances array empty [] if no money was spent.
*/
const reports = [
    {
        id: "week9",
        label: "Week 9 (Nov 24 - 30)",
        stats: { attendance: "11/14", spent: "£450.00", discussion: "7", decisions: "3" },
        finances: [
            { item: "Bus Hire (Peak District)", category: "Transport", amount: "-£450.00", type: "negative" },
            { item: "Bake Sale Revenue", category: "Fundraising", amount: "+£85.00", type: "positive" }
        ],
        minutes: [
            "Approved the motion to subsidize the Peak District trip by 40%.",
            "Discussed potential venues for the Spring Networking dinner.",
            "Noted that the First Year Rep election had the highest turnout in 5 years."
        ]
    },
    {
        id: "week8",
        label: "Week 8 (Nov 17 - 23)",
        stats: { attendance: "14/14", spent: "£0.00", discussion: "5", decisions: "1" },
        finances: [],
        minutes: [
            "AGM held in Roberts 106.",
            "Ratified the Semester 1 Budget.",
            "Confirmed Arup as the primary sponsor for the Design Challenge."
        ]
    }
];

/* --- COMMITTEE MEMBERS --- */
const committee = [
    {
        name: "Alex Smith",
        role: "President",
        email: "alex.smith.24@ucl.ac.uk",
        image: "https://placehold.co/400x400/500778/FFFFFF?text=AS",
        bio: "Third year Civil Engineering student focused on sustainable infrastructure."
    },
    {
        name: "Sarah Jones",
        role: "Treasurer",
        email: "sarah.jones.24@ucl.ac.uk",
        image: "https://placehold.co/400x400/0057B8/FFFFFF?text=SJ",
        bio: "Managing the society finances and sponsorship allocations."
    },
    {
        name: "David Chen",
        role: "Social Sec",
        email: "david.chen.24@ucl.ac.uk",
        image: "https://placehold.co/400x400/D61A68/FFFFFF?text=DC",
        bio: "Organizing the best pub crawls and the Winter Ball."
    },
    {
        name: "Maria Garcia",
        role: "General Secretary",
        email: "maria.garcia.24@ucl.ac.uk",
        image: "https://placehold.co/400x400/D32F2F/FFFFFF?text=MG",
        bio: "Ensuring the smooth operation of committee meetings and elections."
    },
    {
        name: "James Wilson",
        role: "Careers Officer",
        email: "james.wilson.24@ucl.ac.uk",
        image: "https://placehold.co/400x400/C59200/FFFFFF?text=JW",
        bio: "Liaising with industry partners like Arup and Mott MacDonald."
    }
];