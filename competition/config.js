const CONFIG = {
    // --- 1. FREQUENCY SWITCH ---
    collection_id: "test", 

    cloudinary: {
        cloudName: "dji5fn0me", // e.g., "dxy88..."
        uploadPreset: "civsoc_preset"      // The one you just created
    },
    
    // --- 2. TIMELINE ---
    // Set to FUTURE date to see "Submit" mode
    // Set to PAST date to see "Results" mode
    end_date: "2025-12-30T23:59:59", 
    results_duration_days: 7,

    // --- 3. BLIND VOTING ---
    blind_voting: true,

    // --- 4. WINNERS & PRIZES ---
    prizes: {
        individual: [
            { label: "1st Place", value: "£150", icon: "trophy", class: "rank-1" },
            { label: "2nd Place", value: "£100", icon: "medal", class: "rank-2" },
            { label: "3rd Place", value: "£60", icon: "medal", class: "rank-3" },
            { label: "Most Technical", value: "£60", icon: "drafting-compass", class: "rank-special" },
            { label: "Most Creative", value: "£60", icon: "paint-brush", class: "rank-special" },
            { label: "Honorable Mention", value: "£30", icon: "award", class: "rank-hm" }
        ],
        team: [
            { label: "Best Team Design", value: "£300", icon: "users", class: "rank-1" },
            { label: "Runner Up Team", value: "£200", icon: "medal", class: "rank-2" },
            { label: "3rd Place", value: "£120", icon: "medal", class: "rank-3" },
            { label: "Most Technical", value: "£80", icon: "drafting-compass", class: "rank-special" },
            { label: "Most Creative", value: "£80", icon: "paint-brush", class: "rank-special" }
        ]
    },

    // COMMITTEE CONTROL: Exact Author Names for Special Awards
    // Updated to handle both categories
    manual_winners: {
        individual: {
            technical: "Alice Chen", 
            creative: "Ben Miller"
        },
        team: {
            technical: "Structural Squad",
            creative: "Team Bees"
        }
    },

    // --- 5. FIREBASE ---
    firebaseConfig: {
        apiKey: "AIzaSyBnVixoZ0JYRV46EkDQa9XLumUfSmrfWVk",
        authDomain: "contest-c8877.firebaseapp.com",
        projectId: "contest-c8877",
        storageBucket: "contest-c8877.firebasestorage.app",
        messagingSenderId: "616984338580",
        appId: "1:616984338580:web:c420d1d0594594b7e69481"
    }
};
