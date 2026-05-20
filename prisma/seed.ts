import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.submission.deleteMany();
  await prisma.question.deleteMany();
  await prisma.test.deleteMany();

  // Create Test 1
  const test1 = await prisma.test.create({
    data: {
      title: "TOEIC Writing Test 1",
      duration: 60,
    },
  });

  // Part 1 Questions (Q1-Q5): Sentence based on picture
  const part1Questions = [
    {
      questionNumber: 1,
      part: 1,
      promptText:
        "Write ONE sentence based on the picture, using the TWO words or phrases below. You may change the forms of the words and you may use them in any order.",
      imageUrl:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
      keywords: ["meeting", "discuss"],
    },
    {
      questionNumber: 2,
      part: 1,
      promptText:
        "Write ONE sentence based on the picture, using the TWO words or phrases below. You may change the forms of the words and you may use them in any order.",
      imageUrl:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      keywords: ["office", "work"],
    },
    {
      questionNumber: 3,
      part: 1,
      promptText:
        "Write ONE sentence based on the picture, using the TWO words or phrases below. You may change the forms of the words and you may use them in any order.",
      imageUrl:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
      keywords: ["furniture", "arrange"],
    },
    {
      questionNumber: 4,
      part: 1,
      promptText:
        "Write ONE sentence based on the picture, using the TWO words or phrases below. You may change the forms of the words and you may use them in any order.",
      imageUrl:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
      keywords: ["presentation", "audience"],
    },
    {
      questionNumber: 5,
      part: 1,
      promptText:
        "Write ONE sentence based on the picture, using the TWO words or phrases below. You may change the forms of the words and you may use them in any order.",
      imageUrl:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
      keywords: ["together", "study"],
    },
  ];

  // Part 2 Questions (Q6-Q7): Respond to email
  const part2Questions = [
    {
      questionNumber: 6,
      part: 2,
      promptText: `From: Sarah Johnson <sarah.johnson@techcorp.com>
To: All Employees
Subject: Annual Company Picnic

Dear Team,

I'm excited to announce that our annual company picnic will be held on Saturday, July 15th, at Riverside Park. The event will run from 11:00 AM to 4:00 PM.

We're planning several activities including a volleyball tournament, a barbecue lunch, and a raffle with exciting prizes. Families are welcome to attend.

Please let me know:
1. Whether you will be attending
2. How many family members you will bring
3. If you have any dietary restrictions

We need your response by June 30th to finalize the arrangements.

Best regards,
Sarah Johnson
HR Department`,
      imageUrl: null,
      keywords: [],
    },
    {
      questionNumber: 7,
      part: 2,
      promptText: `From: Michael Chen <m.chen@globalshipping.com>
To: Customer Service
Subject: Delayed Shipment - Order #45892

Dear Customer Service,

I placed an order (#45892) on June 1st for office supplies, and the expected delivery date was June 8th. However, it has now been two weeks and I still haven't received my package.

The tracking number (GS-2024-78543) shows that the package has been "in transit" since June 5th with no updates.

I need these supplies urgently for an important client meeting next Monday. Could you please:
1. Look into the status of my shipment
2. Provide an updated delivery estimate
3. Suggest an alternative solution if the package cannot arrive by Friday

I have been a loyal customer for over 5 years and this is very disappointing.

Regards,
Michael Chen
Operations Manager`,
      imageUrl: null,
      keywords: [],
    },
  ];

  // Part 3 Question (Q8): Opinion essay
  const part3Questions = [
    {
      questionNumber: 8,
      part: 3,
      promptText: `Some people believe that working from home is more productive than working in an office. Others think that the office environment is essential for effective work.

Which do you prefer: working from home or working in an office? Give reasons and examples to support your opinion.

Write an essay of at least 300 words.`,
      imageUrl: null,
      keywords: [],
    },
  ];

  const allQuestions = [
    ...part1Questions,
    ...part2Questions,
    ...part3Questions,
  ];

  for (const q of allQuestions) {
    await prisma.question.create({
      data: {
        testId: test1.id,
        ...q,
      },
    });
  }

  console.log(`✅ Created test: "${test1.title}" with ${allQuestions.length} questions`);

  // Create Test 2
  const test2 = await prisma.test.create({
    data: {
      title: "TOEIC Writing Test 2",
      duration: 60,
    },
  });

  const test2Questions = [
    {
      questionNumber: 1,
      part: 1,
      promptText:
        "Write ONE sentence based on the picture, using the TWO words or phrases below.",
      imageUrl:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      keywords: ["technology", "develop"],
    },
    {
      questionNumber: 2,
      part: 1,
      promptText:
        "Write ONE sentence based on the picture, using the TWO words or phrases below.",
      imageUrl:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
      keywords: ["team", "collaborate"],
    },
    {
      questionNumber: 3,
      part: 1,
      promptText:
        "Write ONE sentence based on the picture, using the TWO words or phrases below.",
      imageUrl:
        "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80",
      keywords: ["modern", "design"],
    },
    {
      questionNumber: 4,
      part: 1,
      promptText:
        "Write ONE sentence based on the picture, using the TWO words or phrases below.",
      imageUrl:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
      keywords: ["training", "employee"],
    },
    {
      questionNumber: 5,
      part: 1,
      promptText:
        "Write ONE sentence based on the picture, using the TWO words or phrases below.",
      imageUrl:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
      keywords: ["conference", "attend"],
    },
    {
      questionNumber: 6,
      part: 2,
      promptText: `From: Lisa Park <lisa.park@greenvalley.com>
To: Residents
Subject: Building Maintenance Schedule

Dear Residents,

We will be conducting essential maintenance work on the building's plumbing system next week, from Monday to Wednesday (March 10-12).

During this time:
- Water supply will be interrupted from 9:00 AM to 3:00 PM each day
- Please store enough water for daily needs
- The gym and pool facilities will be closed

We apologize for any inconvenience. Please respond with:
1. Any concerns about the schedule
2. Whether you need special accommodations (medical equipment requiring water, etc.)
3. Your preferred method of receiving updates (email or text)

Thank you for your understanding.

Best,
Lisa Park
Building Management`,
      imageUrl: null,
      keywords: [],
    },
    {
      questionNumber: 7,
      part: 2,
      promptText: `From: David Wilson <d.wilson@marketpro.com>
To: Marketing Team
Subject: Q4 Marketing Strategy Meeting

Hi Team,

As we approach Q4, I'd like to schedule a strategy meeting to discuss our marketing plans for the holiday season.

Key topics:
- Social media campaign review
- Budget allocation for Q4
- New product launch promotion
- Customer feedback analysis

Please reply with:
1. Your availability for next Tuesday or Thursday afternoon
2. One key achievement from Q3 you'd like to highlight
3. Any additional topics you think we should cover

Looking forward to a productive meeting.

Best,
David Wilson
Marketing Director`,
      imageUrl: null,
      keywords: [],
    },
    {
      questionNumber: 8,
      part: 3,
      promptText: `In today's world, many companies are investing heavily in artificial intelligence (AI) and automation. Some people believe this will create more jobs and improve productivity, while others worry it will lead to widespread unemployment.

Do you think AI and automation are beneficial or harmful to the job market? Give specific reasons and examples to support your opinion.

Write an essay of at least 300 words.`,
      imageUrl: null,
      keywords: [],
    },
  ];

  for (const q of test2Questions) {
    await prisma.question.create({
      data: {
        testId: test2.id,
        ...q,
      },
    });
  }

  console.log(`✅ Created test: "${test2.title}" with ${test2Questions.length} questions`);
  console.log("\n🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
