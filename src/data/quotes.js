// Motivational quotes about discipline, consistency, growth, and focus
export const motivationalQuotes = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
  { text: "The difference between who you are and who you want to be is what you do.", author: "Unknown" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "Progress, not perfection, is what we should be asking of ourselves.", author: "Julia Cameron" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Winners embrace hard work. They love the discipline of it.", author: "Lou Holtz" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { text: "You will never change your life until you change something you do daily.", author: "John C. Maxwell" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" }
];

export function getRandomQuote() {
  const index = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[index];
}

export function getDailyQuote() {
  // Get a consistent quote for the day based on date
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % motivationalQuotes.length;
  return motivationalQuotes[index];
}
