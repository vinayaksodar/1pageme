import { Section } from "@/types/resume";

export const INITIAL_PERSONAL_INFO = {
  fullName: "PUSS IN BOOTS",
  jobTitle: "Legendary Swashbuckler & Professional Napper",
  email: "puss@boots.meow",
  phone: "+1 9-LIVES-MEOW",
  address: "The Kingdom of Far Far Away",
  profileImage: "",
  profileImageShape: "circle" as const,
  visibility: {
    showPhone: true,
    showEmail: true,
    showAddress: true,
    showJobTitle: true,
    showPhoto: false,
  },
};

export const INITIAL_SECTIONS: Section[] = [
  {
    id: "summary",
    type: "summary",
    title: "SUMMARY",
    items: [
      {
        id: "s1",
        title: "",
        description: [
          {
            id: "summary-block-1",
            content: [
              {
                type: "text",
                text: "Highly skilled feline with a paws-itive attitude and a sharp blade. Expert in manipulation via 'the eyes,' legendary ogre-slaying, and maintaining a flawless coat. Seeking a position where I can use my cat-like reflexes and irresistible charm to achieve paws-ome results.",
              },
            ],
          },
        ],
        visibility: {
          showTitle: false,
          showSubtitle: false,
          showDescription: true,
          showBullets: false,
          showLocation: false,
          showDatePeriod: false,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "experience",
    type: "experience",
    title: "EXPERIENCE",
    items: [
      {
        id: "exp1",
        title: "Chief Ogre Slayer",
        subtitle: "Shrek's Swamp Services",
        location: "Far Far Away",
        datePeriod: {
          startDate: { month: "Jan", year: 2010 },
          endDate: "Present",
        },
        bullets: [
          {
            id: "exp1-b1",
            content: [
              {
                type: "text",
                text: "Led high-stakes missions to rescue princesses and defeat dragons, ensuring feline dominance.",
              },
            ],
          },
          {
            id: "exp1-b2",
            content: [
              {
                type: "text",
                text: "Mastered the 'Big Eyes' technique, resulting in a 100% success rate in disarming opponents through sheer cuteness.",
              },
            ],
          },
          {
            id: "exp1-b3",
            content: [
              {
                type: "text",
                text: "Successfully managed cross-functional team dynamics between an ogre and a talking donkey.",
              },
            ],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: false,
          showBullets: true,
          showLocation: true,
          showDatePeriod: true,
          showLink: false,
          showLogo: false,
        },
      },
      {
        id: "exp2",
        title: "Senior Milk Taster",
        subtitle: "The Poison Apple",
        location: "San Ricardo",
        datePeriod: {
          startDate: { month: "May", year: 2005 },
          endDate: { month: "Dec", year: 2009 },
        },
        bullets: [
          {
            id: "exp2-b1",
            content: [
              {
                type: "text",
                text: "Evaluated over 50 varieties of premium leche for creaminess and whisker-feel.",
              },
            ],
          },
          {
            id: "exp2-b2",
            content: [
              {
                type: "text",
                text: "Maintained strict quality control standards for saucer cleanliness and temperature.",
              },
            ],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: false,
          showBullets: true,
          showLocation: true,
          showDatePeriod: true,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "education",
    type: "education",
    title: "EDUCATION",
    items: [
      {
        id: "edu1",
        title: "Bachelor of Meowing",
        subtitle: "University of Meow",
        location: "San Ricardo",
        datePeriod: {
          startDate: { month: "Aug", year: 2001 },
          endDate: { month: "May", year: 2005 },
        },
        bullets: [
          {
            id: "edu1-b1",
            content: [{ type: "text", text: "Graduated Summa Cum Litter." }],
          },
          {
            id: "edu1-b2",
            content: [
              {
                type: "text",
                text: "Minor in Red Dot Chasing and Advanced Purring.",
              },
            ],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: false,
          showBullets: true,
          showLocation: true,
          showDatePeriod: true,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "skills",
    type: "skills",
    title: "SKILLS",
    items: [
      {
        id: "ski1",
        title: "Claw-some Abilities",
        bullets: [
          {
            id: "ski1-b1",
            content: [
              { type: "text", text: "Sword fighting (Meow-ster level)" },
            ],
          },
          {
            id: "ski1-b2",
            content: [
              { type: "text", text: "Guitar playing (Purr-fect pitch)" },
            ],
          },
          {
            id: "ski1-b3",
            content: [{ type: "text", text: "Agility (Always lands on feet)" }],
          },
          {
            id: "ski1-b4",
            content: [
              { type: "text", text: "Spanish Guitar & Flamenco Dancing" },
            ],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: false,
          showDescription: false,
          showBullets: true,
          showLocation: false,
          showDatePeriod: false,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "projects",
    type: "projects",
    title: "PROJECTS",
    items: [
      {
        id: "pro1",
        title: "Feline Rescue Operations Dashboard",
        description: [
          {
            id: "pro1-d1",
            content: [
              {
                type: "text",
                text: "Built an operations dashboard to track missions, outcomes, and team assignments across kingdoms.",
              },
            ],
          },
        ],
        datePeriod: {
          startDate: { month: "Feb", year: 2024 },
          endDate: { month: "Nov", year: 2024 },
        },
        link: "https://github.com/example/feline-rescue-dashboard",
        visibility: {
          showTitle: true,
          showSubtitle: false,
          showDescription: true,
          showBullets: false,
          showLocation: false,
          showDatePeriod: true,
          showLink: true,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "certifications",
    type: "certifications",
    title: "CERTIFICATIONS",
    items: [
      {
        id: "cert1",
        title: "Advanced Swordsmanship Mastery",
        subtitle: "Guild of Legendary Heroes",
        datePeriod: {
          startDate: { month: "Mar", year: 2022 },
          endDate: null,
        },
        description: [
          {
            id: "cert1-d1",
            content: [{ type: "text", text: "Credential ID: GUILD-2022-PSB" }],
          },
        ],
        link: "https://guild.example/certifications/GUILD-2022-PSB",
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: true,
          showBullets: false,
          showLocation: false,
          showDatePeriod: true,
          showLink: true,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "languages",
    type: "languages",
    title: "LANGUAGES",
    items: [
      {
        id: "lang1",
        title: "Spanish",
        subtitle: "Native",
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: false,
          showBullets: false,
          showLocation: false,
          showDatePeriod: false,
          showLink: false,
          showLogo: false,
        },
      },
      {
        id: "lang2",
        title: "English",
        subtitle: "Professional",
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: false,
          showBullets: false,
          showLocation: false,
          showDatePeriod: false,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "volunteering",
    type: "volunteering",
    title: "VOLUNTEER EXPERIENCE",
    items: [
      {
        id: "vol1",
        title: "Community Safety Volunteer",
        subtitle: "Far Far Away Animal Shelter",
        location: "Far Far Away",
        datePeriod: {
          startDate: { month: "Jan", year: 2021 },
          endDate: { month: "Dec", year: 2022 },
        },
        bullets: [
          {
            id: "vol1-b1",
            content: [
              {
                type: "text",
                text: "Coordinated adoption events and safety workshops for rescued animals.",
              },
            ],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: false,
          showBullets: true,
          showLocation: true,
          showDatePeriod: true,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "awards",
    type: "awards",
    title: "AWARDS",
    items: [
      {
        id: "awd1",
        title: "Hero of the Kingdom",
        subtitle: "Royal Council of Far Far Away",
        datePeriod: {
          startDate: { month: "Jun", year: 2011 },
          endDate: null,
        },
        description: [
          {
            id: "awd1-d1",
            content: [
              {
                type: "text",
                text: "Recognized for bravery and leadership in high-risk rescue missions.",
              },
            ],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: true,
          showBullets: false,
          showLocation: false,
          showDatePeriod: true,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "publications",
    type: "publications",
    title: "PUBLICATIONS",
    items: [
      {
        id: "pub1",
        title: "Advanced Defensive Techniques for High-Risk Missions",
        subtitle: "Kingdom Security Journal",
        datePeriod: {
          startDate: { month: "Sep", year: 2023 },
          endDate: null,
        },
        description: [
          {
            id: "pub1-d1",
            content: [
              {
                type: "text",
                text: "Puss in Boots, Donkey. Vol 12(3), pp. 44-58.",
              },
            ],
          },
        ],
        link: "https://doi.org/10.1234/ksj.2023.44",
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: true,
          showBullets: false,
          showLocation: false,
          showDatePeriod: true,
          showLink: true,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "patents",
    type: "patents",
    title: "PATENTS",
    items: [
      {
        id: "pat1",
        title: "Collapsible Rapier Guard Mechanism",
        subtitle: "US-11,234,567",
        datePeriod: {
          startDate: { month: "Apr", year: 2022 },
          endDate: null,
        },
        description: [
          {
            id: "pat1-d1",
            content: [
              {
                type: "text",
                text: "A compact guard design improving blade safety during travel.",
              },
            ],
          },
        ],
        link: "https://patents.example/US11234567",
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: true,
          showBullets: false,
          showLocation: false,
          showDatePeriod: true,
          showLink: true,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "courses",
    type: "courses",
    title: "COURSES",
    items: [
      {
        id: "cou1",
        title: "Negotiation for Cross-Functional Teams",
        subtitle: "Far Far Academy",
        datePeriod: {
          startDate: { month: "Feb", year: 2024 },
          endDate: null,
        },
        description: [
          {
            id: "cou1-d1",
            content: [
              {
                type: "text",
                text: "Conflict resolution, stakeholder communication, tactical planning.",
              },
            ],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: true,
          showBullets: false,
          showLocation: false,
          showDatePeriod: true,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "references",
    type: "references",
    title: "REFERENCES",
    items: [
      {
        id: "ref1",
        title: "Shrek",
        subtitle: "Team Lead, Swamp Services",
        description: [
          {
            id: "ref1-d1",
            content: [{ type: "text", text: "shrek@swamp.me | +1 555-0102" }],
          },
        ],
        link: "https://linkedin.com/in/shrek",
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: true,
          showBullets: false,
          showLocation: false,
          showDatePeriod: false,
          showLink: true,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "leadership",
    type: "leadership",
    title: "LEADERSHIP",
    items: [
      {
        id: "ldr1",
        title: "Mission Captain",
        subtitle: "Swamp Services",
        location: "Far Far Away",
        datePeriod: {
          startDate: { month: "Jan", year: 2018 },
          endDate: { month: "Dec", year: 2020 },
        },
        bullets: [
          {
            id: "ldr1-b1",
            content: [
              {
                type: "text",
                text: "Led a 5-member team through multi-stakeholder rescue operations.",
              },
            ],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: false,
          showBullets: true,
          showLocation: true,
          showDatePeriod: true,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "professional-affiliations",
    type: "professional-affiliations",
    title: "PROFESSIONAL AFFILIATIONS",
    items: [
      {
        id: "aff1",
        title: "International Guild of Heroes",
        subtitle: "Member",
        datePeriod: {
          startDate: { month: "Jan", year: 2019 },
          endDate: "Present",
        },
        description: [
          {
            id: "aff1-d1",
            content: [
              {
                type: "text",
                text: "Contributed to quarterly safety and ethics working group.",
              },
            ],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: true,
          showBullets: false,
          showLocation: false,
          showDatePeriod: true,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "conferences",
    type: "conferences",
    title: "CONFERENCES & TALKS",
    items: [
      {
        id: "conf1",
        title: "Operational Calm Under Pressure",
        subtitle: "Kingdom Operations Summit",
        location: "San Ricardo",
        datePeriod: {
          startDate: { month: "Oct", year: 2024 },
          endDate: null,
        },
        description: [
          {
            id: "conf1-d1",
            content: [
              {
                type: "text",
                text: "Presented practical frameworks for high-pressure decision making.",
              },
            ],
          },
        ],
        link: "https://events.example/kos-2024",
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: true,
          showBullets: false,
          showLocation: true,
          showDatePeriod: true,
          showLink: true,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "achievements",
    type: "achievements",
    title: "ACHIEVEMENTS",
    items: [
      {
        id: "ach1",
        title: "Reduced mission incident rate by 40%",
        subtitle: "Swamp Services",
        datePeriod: {
          startDate: { month: "Dec", year: 2020 },
          endDate: null,
        },
        description: [
          {
            id: "ach1-d1",
            content: [
              {
                type: "text",
                text: "Introduced a pre-mission checklist adopted across all field teams.",
              },
            ],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: true,
          showDescription: true,
          showBullets: false,
          showLocation: false,
          showDatePeriod: true,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
  {
    id: "interests",
    type: "interests",
    title: "INTERESTS",
    items: [
      {
        id: "int1",
        title: "Creative and Athletic",
        bullets: [
          {
            id: "int1-b1",
            content: [{ type: "text", text: "Flamenco guitar" }],
          },
          {
            id: "int1-b2",
            content: [{ type: "text", text: "Trail running" }],
          },
        ],
        visibility: {
          showTitle: true,
          showSubtitle: false,
          showDescription: false,
          showBullets: true,
          showLocation: false,
          showDatePeriod: false,
          showLink: false,
          showLogo: false,
        },
      },
    ],
  },
];
