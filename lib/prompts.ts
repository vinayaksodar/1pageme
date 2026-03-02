export const LLM_PROMPT = `I want you to act as a resume parser. I will provide you with a resume PDF (or text content), and I want you to extract the information into a specific JSON format.

### TYPE DEFINITIONS
- TextNode: { type: "text", text: string }
- Block: { id: string, content: TextNode[] }
- SectionType: "summary" | "experience" | "education" | "projects" | "skills" | "certifications" | "languages" | "volunteering" | "awards" | "publications" | "patents" | "courses" | "references" | "leadership" | "professional-affiliations" | "conferences" | "achievements" | "interests" | "custom"

### TARGET JSON STRUCTURE
{
  "title": "Resume Title",
  "content": {
    "personalInfo": {
      "fullName": "Name",
      "email": "Email",
      "phone": "Phone",
      "address": "Address",
      "jobTitle": "Job Title",
      "visibility": { "showPhone": true, "showEmail": true, "showAddress": true, "showJobTitle": true, "showPhoto": false }
    },
    "sections": [
      {
        "id": "unique-section-id",
        "type": "SectionType",
        "title": "SECTION TITLE",
        "items": [
          {
            "id": "unique-item-id",
            "title": "Role/Degree",
            "subtitle": "Company/University",
            "location": "Location",
            "datePeriod": { startDate: { month: "Jan", year: 2024 }, endDate: "Present" },
            "description": [ { "id": "block-1", "content": [{ "type": "text", "text": "..." }] } ],
            "bullets": [ { "id": "bullet-1", "content": [{ "type": "text", "text": "..." }] } ],
            "visibility": { "showTitle": true, "showSubtitle": true, "showDescription": true, "showBullets": true, "showLocation": true, "showDatePeriod": true, "showLink": false, "showLogo": false }
          }
        ]
      }
    ]
  }
}

You are acting as a deterministic resume parser.

STRICT REQUIREMENTS:
- Extract ALL sections and ALL items from the resume.
- Do NOT summarize.
- Do NOT omit any entries.
- Do NOT infer missing data.
- Preserve exact wording.
- Do NOT generate UI defaults like layouts, template styles, or accent colors.
- If a section contains N items, the output must contain exactly N items.

Before returning the final JSON:
1. Count items in each section in the source.
2. Verify counts match in the output.
3. If mismatch exists, fix it before outputting.

Completeness and structural accuracy are mandatory.
Return only valid JSON.

Please parse my resume now.`;
