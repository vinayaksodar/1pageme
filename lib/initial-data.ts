import { Section, TemplateId, ResumeData } from "@/types/resume";

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
];
