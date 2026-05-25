import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  // account
  await pool.query(`
    INSERT INTO mail_accounts (id, name, email, provider)
    VALUES ('acct-demo', 'Alex Morgan', 'alex.morgan@example.com', 'Example Mail')
    ON CONFLICT (id) DO NOTHING
  `);

  // folders
  const folders = [
    { id: 'folder-inbox', name: 'Inbox', type: 'inbox', unread: 3 },
    { id: 'folder-sent', name: 'Sent', type: 'sent', unread: 0 },
    { id: 'folder-drafts', name: 'Drafts', type: 'drafts', unread: 1 },
    { id: 'folder-trash', name: 'Trash', type: 'trash', unread: 0 },
    { id: 'folder-spam', name: 'Spam', type: 'spam', unread: 0 },
    { id: 'folder-archive', name: 'Archive', type: 'archive', unread: 0 },
  ];
  for (const f of folders) {
    await pool.query(`
      INSERT INTO mail_folders (id, name, account_id, type, unread_count)
      VALUES ($1, $2, 'acct-demo', $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, [f.id, f.name, f.type, f.unread]);
  }

  // emails
  const now = new Date();
  const emails = [
    {
      id: 'em-001', subject: 'Welcome to your new Mail app',
      senderName: 'Mail Team', senderEmail: 'team@mail.example.com',
      recipients: [{ name: 'Alex Morgan', email: 'alex.morgan@example.com' }],
      folderId: 'folder-inbox', isRead: false, isStarred: true,
      sentAt: new Date(now - 5 * 60 * 1000),
      body: `Hi Alex!\n\nWelcome to your new Mail app. Here are a few tips to get started:\n\n- Use the sidebar to navigate between Inbox, Sent, Drafts, and more\n- Star important emails to find them quickly\n- The calendar view helps you stay on top of meetings\n- Contacts keeps your network organized\n\nHappy emailing!\n\n— The Mail Team`,
      preview: 'Hi Alex! Welcome to your new Mail app. Here are a few tips to get started...',
      hasAttachments: false,
    },
    {
      id: 'em-002', subject: 'Project kickoff meeting tomorrow',
      senderName: 'Sarah Chen', senderEmail: 'sarah.chen@design.co',
      recipients: [{ name: 'Alex Morgan', email: 'alex.morgan@example.com' }, { name: 'Team', email: 'team@design.co' }],
      folderId: 'folder-inbox', isRead: false, isStarred: false,
      sentAt: new Date(now - 2 * 60 * 60 * 1000),
      body: `Hey team!\n\nJust a reminder that our project kickoff is scheduled for tomorrow at 10 AM in Conference Room B.\n\nAgenda:\n1. Review project scope and timeline\n2. Assign roles and responsibilities\n3. Set up communication channels\n4. Q&A\n\nPlease come prepared with your initial thoughts on the wireframes we shared last week.\n\nSee you there!\n\nSarah`,
      preview: 'Hey team! Just a reminder that our project kickoff is scheduled for tomorrow...',
      hasAttachments: true,
    },
    {
      id: 'em-003', subject: 'Invoice #2847 — Design Services',
      senderName: 'Billing Department', senderEmail: 'billing@design.co',
      recipients: [{ name: 'Alex Morgan', email: 'alex.morgan@example.com' }],
      folderId: 'folder-inbox', isRead: true, isStarred: false,
      sentAt: new Date(now - 24 * 60 * 60 * 1000),
      body: `Dear Alex Morgan,\n\nPlease find attached Invoice #2847 for design services rendered in May 2026.\n\nAmount due: $4,250.00\nDue date: June 15, 2026\n\nPayment can be made via bank transfer or credit card through our portal.\n\nThank you for your business!\n\nBilling Department\nDesign Co.`,
      preview: 'Please find attached Invoice #2847 for design services rendered in May 2026...',
      hasAttachments: true,
    },
    {
      id: 'em-004', subject: 'Your weekly report is ready',
      senderName: 'Analytics Bot', senderEmail: 'analytics@tools.example.com',
      recipients: [{ name: 'Alex Morgan', email: 'alex.morgan@example.com' }],
      folderId: 'folder-inbox', isRead: false, isStarred: false,
      sentAt: new Date(now - 48 * 60 * 60 * 1000),
      body: `Hi Alex,\n\nYour weekly analytics report is now available. Here are the highlights:\n\n- Website traffic up 12% vs last week\n- New signups: 847\n- Conversion rate: 3.2%\n- Top referrers: Google, LinkedIn, Twitter\n\nView the full dashboard: https://analytics.tools.example.com\n\n— Analytics Bot`,
      preview: 'Your weekly analytics report is now available. Here are the highlights...',
      hasAttachments: false,
    },
    {
      id: 'em-005', subject: 'Lunch this Friday?',
      senderName: 'Jordan Park', senderEmail: 'jordan@friends.example.com',
      recipients: [{ name: 'Alex Morgan', email: 'alex.morgan@example.com' }],
      folderId: 'folder-inbox', isRead: true, isStarred: true,
      sentAt: new Date(now - 72 * 60 * 60 * 1000),
      body: `Hey Alex!\n\nWant to grab lunch this Friday? I found a new Thai place downtown that looks amazing. Let me know if you're free around 12:30!\n\nJordan`,
      preview: 'Hey Alex! Want to grab lunch this Friday? I found a new Thai place...',
      hasAttachments: false,
    },
    {
      id: 'em-006', subject: 'Re: Q2 Planning',
      senderName: 'Alex Morgan', senderEmail: 'alex.morgan@example.com',
      recipients: [{ name: 'Sarah Chen', email: 'sarah.chen@design.co' }],
      folderId: 'folder-sent', isRead: true, isStarred: false,
      sentAt: new Date(now - 4 * 60 * 60 * 1000),
      body: `Hi Sarah,\n\nThanks for the planning doc. I've reviewed it and have a few thoughts:\n\n1. The timeline looks aggressive but achievable\n2. We should add a buffer for user testing\n3. I'll update the resource allocation sheet by EOD\n\nLet me know if you want to sync before the kickoff.\n\n— Alex`,
      preview: 'Thanks for the planning doc. I\'ve reviewed it and have a few thoughts...',
      hasAttachments: false,
    },
    {
      id: 'em-007', subject: 'Draft: Marketing proposal',
      senderName: 'Alex Morgan', senderEmail: 'alex.morgan@example.com',
      recipients: [{ name: 'Draft', email: '' }],
      folderId: 'folder-drafts', isRead: true, isStarred: false,
      sentAt: new Date(now - 1 * 60 * 60 * 1000),
      body: `Hi Marketing Team,\n\nI've put together a proposal for the Q3 campaign. The key points are:\n\n- Focus on customer success stories\n- Video-first content strategy\n- Target audience: mid-market SaaS companies\n\n[Draft continues...]\n\n— Alex`,
      preview: 'I\'ve put together a proposal for the Q3 campaign. The key points are...',
      hasAttachments: false,
    },
    {
      id: 'em-008', subject: 'Newsletter: May edition',
      senderName: 'Tech Weekly', senderEmail: 'newsletter@techweekly.io',
      recipients: [{ name: 'Alex Morgan', email: 'alex.morgan@example.com' }],
      folderId: 'folder-trash', isRead: true, isStarred: false,
      sentAt: new Date(now - 96 * 60 * 60 * 1000),
      body: `This month's top stories:\n\n1. AI advancements in healthcare\n2. New framework releases\n3. Startup funding roundup\n\nRead more at techweekly.io\n\n— Tech Weekly Team`,
      preview: 'This month\'s top stories: AI advancements in healthcare, New framework releases...',
      hasAttachments: false,
    },
  ];

  for (const e of emails) {
    await pool.query(`
      INSERT INTO emails (id, subject, sender_name, sender_email, recipients_json, folder_id, is_read, is_starred, sent_at, body, preview, has_attachments)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO NOTHING
    `, [
      e.id, e.subject, e.senderName, e.senderEmail,
      JSON.stringify(e.recipients), e.folderId, e.isRead, e.isStarred,
      e.sentAt.toISOString(), e.body, e.preview, e.hasAttachments,
    ]);
  }

  // contacts
  const contacts = [
    { id: 'ct-001', name: 'Sarah Chen', email: 'sarah.chen@design.co', phone: '+1-555-0101', company: 'Design Co', notes: 'Project lead for Q2' },
    { id: 'ct-002', name: 'Jordan Park', email: 'jordan@friends.example.com', phone: '+1-555-0102', company: null, notes: 'Old college friend' },
    { id: 'ct-003', name: 'Marcus Rivera', email: 'marcus.rivera@tech.io', phone: '+1-555-0103', company: 'Tech.io', notes: 'Potential partner' },
    { id: 'ct-004', name: 'Emily Watson', email: 'emily.w@startup.xyz', phone: '+1-555-0104', company: 'Startup XYZ', notes: 'Investor relations' },
    { id: 'ct-005', name: 'David Kim', email: 'david.kim@agency.com', phone: '+1-555-0105', company: 'Creative Agency', notes: 'Freelance designer' },
  ];
  for (const c of contacts) {
    await pool.query(`
      INSERT INTO contacts (id, name, email, phone, company, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING
    `, [c.id, c.name, c.email, c.phone, c.company, c.notes]);
  }

  // calendar events
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const events = [
    { id: 'ev-001', title: 'Project Kickoff', start: new Date(y, m, d + 1, 10), end: new Date(y, m, d + 1, 11, 30), loc: 'Conference Room B', desc: 'Initial planning meeting for the new product launch' },
    { id: 'ev-002', title: 'Design Review', start: new Date(y, m, d + 2, 14), end: new Date(y, m, d + 2, 15), loc: 'Zoom', desc: 'Review latest mockups with the design team' },
    { id: 'ev-003', title: 'Lunch with Jordan', start: new Date(y, m, d + 4, 12, 30), end: new Date(y, m, d + 4, 13, 30), loc: 'Thai Basil Downtown', desc: 'Catch up over lunch' },
    { id: 'ev-004', title: 'Team Standup', start: new Date(y, m, d, 9), end: new Date(y, m, d, 9, 30), loc: 'Zoom', desc: 'Daily team sync' },
    { id: 'ev-005', title: 'Client Presentation', start: new Date(y, m, d + 3, 15), end: new Date(y, m, d + 3, 16), loc: 'Main Boardroom', desc: 'Present Q2 results to the client' },
  ];
  for (const e of events) {
    await pool.query(`
      INSERT INTO calendar_events (id, title, start_at, end_at, location, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING
    `, [e.id, e.title, e.start.toISOString(), e.end.toISOString(), e.loc, e.desc]);
  }

  // attendees
  const attendees = [
    { eventId: 'ev-001', email: 'sarah.chen@design.co', name: 'Sarah Chen', status: 'accepted' },
    { eventId: 'ev-001', email: 'alex.morgan@example.com', name: 'Alex Morgan', status: 'accepted' },
    { eventId: 'ev-002', email: 'sarah.chen@design.co', name: 'Sarah Chen', status: 'tentative' },
    { eventId: 'ev-004', email: 'sarah.chen@design.co', name: 'Sarah Chen', status: 'accepted' },
    { eventId: 'ev-004', email: 'marcus.rivera@tech.io', name: 'Marcus Rivera', status: 'accepted' },
    { eventId: 'ev-004', email: 'emily.w@startup.xyz', name: 'Emily Watson', status: 'pending' },
    { eventId: 'ev-005', email: 'emily.w@startup.xyz', name: 'Emily Watson', status: 'accepted' },
  ];
  for (const a of attendees) {
    await pool.query(`
      INSERT INTO calendar_event_attendees (event_id, email, name, status)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `, [a.eventId, a.email, a.name, a.status]);
  }

  await pool.end();
  console.log('Mail seed complete!');
}

seed().catch((err) => { console.error(err); process.exit(1); });
