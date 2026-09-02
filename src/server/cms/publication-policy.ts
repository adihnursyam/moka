export type PublicationWorkflow = "reviewed" | "immediate";

const immediateFields = new Set([
  "siteSettings.tagline", "pageSection.shortDescription", "galleryItem.caption",
  "sponsor.name", "person.shortBio", "organizationAssignment.title",
]);

export function getPublicationWorkflow(resourceType: string, field?: string): PublicationWorkflow {
  return field && immediateFields.has(`${resourceType}.${field}`) ? "immediate" : "reviewed";
}
