export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  content: string;
  coverImage?: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-write-a-one-page-resume",
    title: "How to Write a High-Converting One-Page Resume",
    excerpt:
      "Learn the secrets of condensing your professional history into a single, high-impact page.",
    date: "March 1, 2026",
    author: "Vinayak Sodar",
    content: `
      <p>In the modern job market, brevity is power. Recruiters spend an average of 6 seconds looking at a resume before deciding whether to move forward. If your resume is a three-page novel, you've already lost them.</p>
      
      <h3>The Power of One Page</h3>
      <p>A one-page resume forces you to prioritize. It ensures that every word on the page is earning its keep. It's not about what you did; it's about what you achieved that is relevant to the job you want next.</p>
      
      <h3>Key Strategies</h3>
      <ul>
        <li><strong>Focus on Impact:</strong> Use action verbs and quantify your results. Instead of "Managed a team," say "Managed a team of 10, increasing productivity by 25%."</li>
        <li><strong>White Space is Your Friend:</strong> Don't try to cram everything in. Use strategic spacing to make the document readable.</li>
        <li><strong>Modern Templates:</strong> Use clean, professional fonts and layouts that guide the eye to the most important information.</li>
      </ul>
      
      <p>At 1PageMe, we've designed our templates specifically to solve the one-page problem. Our intelligent layouts adjust spacing and font sizes to ensure your content looks perfect without you having to fight with margins in Word.</p>
    `,
  },
  {
    slug: "modern-resume-trends-2026",
    title: "Modern Resume Trends to Watch in 2026",
    excerpt:
      "From AI-friendly formatting to minimalist design, see what's changing in the world of resumes.",
    date: "February 25, 2026",
    author: "Career Expert",
    content: `
      <p>The resume landscape is shifting. With the rise of AI in recruitment and the focus on skills over degrees, your resume needs to evolve.</p>
      
      <h3>AI-Ready Formatting</h3>
      <p>Applicant Tracking Systems (ATS) are getting smarter, but they still prefer clean, structured data. Avoid complex graphics that might confuse a parser.</p>
      
      <h3>The Skill-First Approach</h3>
      <p>Companies are looking for specific competencies. Highlighting your tech stack and soft skills prominently is more important than ever.</p>
    `,
  },
];
