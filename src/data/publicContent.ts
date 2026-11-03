import { z } from "zod";

export const blogPosts = [
  {
    id: "3",
    title: "Building AgriHubX: Nixon's Self-Taught Journey",
    category: "School Innovation",
    excerpt: "A self-taught developer building an agricultural app with AI-assisted tools, React and existing libraries.",
    body: [
      "AgriHubX is a self-taught development project built with AI-assisted tools. It uses React, existing libraries and reusable interface components rather than claiming every part was written from scratch.",
      "AI assistance can help draft code and explore solutions, but generated suggestions still need review and testing. Building the app involves connecting its marketplace, community and farming tools, checking how they work together, and improving the experience on phones.",
      "The work is an ongoing learning process. Using frameworks and assistance honestly is part of that process—not a substitute for checking whether the finished experience works.",
    ],
  },
  {
    id: "4",
    title: "Privacy First: No GPS Tracking",
    category: "Agricultural Tips",
    excerpt: "AgriHubX uses voluntary country and county selection instead of GPS tracking, keeping location sharing in your control.",
    body: [
      "AgriHubX does not use GPS or live location tracking. You select a country and county manually, so using the app does not require sharing your precise position.",
      "Your selected county helps localize farming information. A saved weather location can differ from your profile location; neither requires the app to read your device's GPS.",
      "When writing a listing, community post or message, avoid including a precise home address or other private information unless you deliberately want to share it. Review the Privacy Policy for more information about the app's data handling.",
    ],
  },
];

export function filterArticles<T extends { title: string; category: string; excerpt: string }>(articles: T[], query: string): T[] {
  const term = query.trim().toLocaleLowerCase();
  return articles.filter(article => [article.title, article.category, article.excerpt].some(value => value.toLocaleLowerCase().includes(term)));
}

export const isValidSubscriptionEmail = (email: string) => z.string().email().safeParse(email.trim()).success;
export const SUBSCRIPTION_SUBJECT = "Subscribe me to AgriHubX updates";
