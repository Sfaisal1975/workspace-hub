import { db } from "@workspace/db";
import {
  mailAccountsTable,
  mailFoldersTable,
  emailsTable,
  contactsTable,
  calendarEventsTable,
  calendarEventAttendeesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

async function seed() {
  // Seed account
  const accountId = "acct-demo";
  await db.insert(mailAccountsTable).values({
    id: accountId,
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    provider: "Example Mail",
    avatarUrl: null,
  }).onConflictDoNothing();

  // Seed folders
  const folders = [
    { id: "folder-inbox", name: "Inbox", accountId, type: "inbox", unreadCount: 3 },
    { id: "folder-sent", name: "Sent", accountId, type: "sent", unreadCount: 0 },
    { id: "folder-drafts", name: "Drafts", accountId, type: "drafts", unreadCount: 1 },
    { id: "folder-trash", name: "Trash", accountId, type: "trash", unreadCount: 0 },
    { id: "folder-spam", name: "Spam", accountId, type: "spam", unreadCount: 0 },
    { id: "folder-archive", name: "Archive", accountId, type: "archive", unreadCount: 0 },
  ];
  for (const f of folders) {
    await db.insert(mailFoldersTable).values(f).onConflictDoNothing();
  }

  // Seed emails
  const emails = [
    {
      id: "em-001",
      subject: "Welcome to your new Mail app",
      senderName: "Mail Team",
      senderEmail: "team@mail.example.com",
      senderAvatarUrl: null,
      recipientsJson: JSON.stringify([{ name: "Alex Morgan", email: "alex.morgan@example.com" }]),
      folderId: "folder-inbox",
      isRead: false,
      isStarred: true,
      sentAt: new Date(Date.now() - 1000 * 60 * 5),
      body: "Hi Alex!\n\nWelcome to your new Mail app. Here are a few tips to get started:\n\n- Use the sidebar to navigate between Inbox, Sent, Drafts, and more\n- Star important emails to find them quickly\n- The calendar view helps you stay on top of meetings\n- Contacts keeps your network organized\n\nHappy emailing!\n\n— The Mail Team",
      preview: "Hi Alex! Welcome to your new Mail app. Here are a few tips to get started...",
      hasAttachments: false,
    },
    {
      id: "em-002",
      subject: "Project kickoff meeting tomorrow",
      senderName: "Sarah Chen",
      senderEmail: "sarah.chen@design.co",
      senderAvatarUrl: null,
      recipientsJson: JSON.stringify([{ name: "Alex Morgan", email: "alex.morgan@example.com" }, { name: "Team", email: "team@design.co" }]),
      folderId: "folder-inbox",
      isRead: false,
      isStarred: false,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      body: "Hey team!\n\nJust a reminder that our project kickoff is scheduled for tomorrow at 10 AM in Conference Room B.\n\nAgenda:\n1. Review project scope and timeline\n2. Assign roles and responsibilities\n3. Set up communication channels\n4. Q&A\n\nPlease come prepared with your initial thoughts on the wireframes we shared last week.\n\nSee you there!\n\nSarah",
      preview: "Hey team! Just a reminder that our project kickoff is scheduled for tomorrow...",
      hasAttachments: true,
    },
    {
      id: "em-003",
      subject: "Invoice #2847 — Design Services",
      senderName: "Billing Department",
      senderEmail: "billing@design.co",
      senderAvatarUrl: null,
      recipientsJson: JSON.stringify([{ name: "Alex Morgan", email: "alex.morgan@example.com" }]),
      folderId: "folder-inbox",
      isRead: true,
      isStarred: false,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      body: "Dear Alex Morgan,\n\nPlease find attached Invoice #2847 for design services rendered in May 2026.\n\nAmount due: $4,250.00\nDue date: June 15, 2026\n\nPayment can be made via bank transfer or credit card through our portal.\n\nThank you for your business!\n\nBilling Department\nDesign Co.",
      preview: "Please find attached Invoice #2847 for design services rendered in May 2026...",
      hasAttachments: true,
    },
    {
      id: "em-004",
      subject: "Your weekly report is ready",
      senderName: "Analytics Bot",
      senderEmail: "analytics@tools.example.com",
      senderAvatarUrl: null,
      recipientsJson: JSON.stringify([{ name: "Alex Morgan", email: "alex.morgan@example.com" }]),
      folderId: "folder-inbox",
      isRead: false,
      isStarred: false,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      body: "Hi Alex,\n\nYour weekly analytics report is now available. Here are the highlights:\n\n- Website traffic up 12% vs last week\n- New signups: 847\n- Conversion rate: 3.2%\n- Top referrers: Google, LinkedIn, Twitter\n\nView the full dashboard: https://analytics.tools.example.com\n\n— Analytics Bot",
      preview: "Your weekly analytics report is now available. Here are the highlights...",
      hasAttachments: false,
    },
    {
      id: "em-005",
      subject: "Lunch this Friday?",
      senderName: "Jordan Park",
      senderEmail: "jordan@friends.example.com",
      senderAvatarUrl: null,
      recipientsJson: JSON.stringify([{ name: "Alex Morgan", email: "alex.morgan@example.com" }]),
      folderId: "folder-inbox",
      isRead: true,
      isStarred: true,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      body: "Hey Alex!\n\nWant to grab lunch this Friday? I found a new Thai place downtown that looks amazing. Let me know if you're free around 12:30!\n\nJordan",
      preview: "Hey Alex! Want to grab lunch this Friday? I found a new Thai place...",
      hasAttachments: false,
    },
    {
      id: "em-006",
      subject: "Re: Q2 Planning",
      senderName: "Alex Morgan",
      senderEmail: "alex.morgan@example.com",
      senderAvatarUrl: null,
      recipientsJson: JSON.stringify([{ name: "Sarah Chen", email: "sarah.chen@design.co" }]),
      folderId: "folder-sent",
      isRead: true,
      isStarred: false,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      body: "Hi Sarah,\n\nThanks for the planning doc. I've reviewed it and have a few thoughts:\n\n1. The timeline looks aggressive but achievable\n2. We should add a buffer for user testing\n3. I'll update the resource allocation sheet by EOD\n\nLet me know if you want to sync before the kickoff.\n\n— Alex",
      preview: "Thanks for the planning doc. I've reviewed it and have a few thoughts...",
      hasAttachments: false,
    },
    {
      id: "em-007",
      subject: "Draft: Marketing proposal",
      senderName: "Alex Morgan",
      senderEmail: "alex.morgan@example.com",
      senderAvatarUrl: null,
      recipientsJson: JSON.stringify([{ name: "Draft", email: "" }]),
      folderId: "folder-drafts",
      isRead: true,
      isStarred: false,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
      body: "Hi Marketing Team,\n\nI've put together a proposal for the Q3 campaign. The key points are:\n\n- Focus on customer success stories\n- Video-first content strategy\n- Target audience: mid-market SaaS companies\n\n[Draft continues...]\n\n— Alex",
      preview: "I've put together a proposal for the Q3 campaign. The key points are...",
      hasAttachments: false,
    },
    {
      id: "em-008",
      subject: "Newsletter: May edition",
      senderName: "Tech Weekly",
      senderEmail: "newsletter@techweekly.io",
      senderAvatarUrl: null,
      recipientsJson: JSON.stringify([{ name: "Alex Morgan", email: "alex.morgan@example.com" }]),
      folderId: "folder-trash",
      isRead: true,
      isStarred: false,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
      body: "This month's top stories:\n\n1. AI advancements in healthcare\n2. New framework releases\n3. Startup funding roundup\n\nRead more at techweekly.io\n\n— Tech Weekly Team",
      preview: "This month's top stories: AI advancements in healthcare, New framework releases...",
      hasAttachments: false,
    },
  ];
  for (const e of emails) {
    await db.insert(emailsTable).values(e).onConflictDoNothing();
  }

  // Seed contacts
  const contacts = [
    { id: "ct-001", name: "Sarah Chen", email: "sarah.chen@design.co", phone: "+1-555-0101", company: "Design Co", notes: "Project lead for Q2" },
    { id: "ct-002", name: "Jordan Park", email: "jordan@friends.example.com", phone: "+1-555-0102", company: null, notes: "Old college friend" },
    { id: "ct-003", name: "Marcus Rivera", email: "marcus.rivera@tech.io", phone: "+1-555-0103", company: "Tech.io", notes: "Potential partner" },
    { id: "ct-004", name: "Emily Watson", email: "emily.w@startup.xyz", phone: "+1-555-0104", company: "Startup XYZ", notes: "Investor relations" },
    { id: "ct-005", name: "David Kim", email: "david.kim@agency.com", phone: "+1-555-0105", company: "Creative Agency", notes: "Freelance designer" },
  ];
  for (const c of contacts) {
    await db.insert(contactsTable).values(c).onConflictDoNothing();
  }

  // Seed calendar events
  const now = new Date();
  const events = [
    {
      id: "ev-001",
      title: "Project Kickoff",
      startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
      endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 30),
      location: "Conference Room B",
      description: "Initial planning meeting for the new product launch",
    },
    {
      id: "ev-002",
      title: "Design Review",
      startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0),
      endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 0),
      location: "Zoom",
      description: "Review latest mockups with the design team",
    },
    {
      id: "ev-003",
      title: "Lunch with Jordan",
      startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 12, 30),
      endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 13, 30),
      location: "Thai Basil Downtown",
      description: "Catch up over lunch",
    },
    {
      id: "ev-004",
      title: "Team Standup",
      startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
      endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30),
      location: "Zoom",
      description: "Daily team sync",
    },
    {
      id: "ev-005",
      title: "Client Presentation",
      startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 15, 0),
      endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 16, 0),
      location: "Main Boardroom",
      description: "Present Q2 results to the client",
    },
  ];
  for (const ev of events) {
    await db.insert(calendarEventsTable).values(ev).onConflictDoNothing();
  }

  // Seed attendees
  const attendees = [
    { eventId: "ev-001", email: "sarah.chen@design.co", name: "Sarah Chen", status: "accepted" },
    { eventId: "ev-001", email: "alex.morgan@example.com", name: "Alex Morgan", status: "accepted" },
    { eventId: "ev-002", email: "sarah.chen@design.co", name: "Sarah Chen", status: "tentative" },
    { eventId: "ev-004", email: "sarah.chen@design.co", name: "Sarah Chen", status: "accepted" },
    { eventId: "ev-004", email: "marcus.rivera@tech.io", name: "Marcus Rivera", status: "accepted" },
    { eventId: "ev-004", email: "emily.w@startup.xyz", name: "Emily Watson", status: "pending" },
    { eventId: "ev-005", email: "emily.w@startup.xyz", name: "Emily Watson", status: "accepted" },
  ];
  for (const a of attendees) {
    const existing = await db.select().from(calendarEventAttendeesTable).where(eq(calendarEventAttendeesTable.eventId, a.eventId));
    if (!existing.find((x) => x.email === a.email)) {
      await db.insert(calendarEventAttendeesTable).values(a);
    }
  }

  console.log("Mail seed complete!");
}

seed().catch(console.error);
