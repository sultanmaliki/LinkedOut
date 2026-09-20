// JSON.stringify does not escape "</", so a value containing the literal
// substring "</script>" (e.g. a user-controlled bio or company name) would
// close the surrounding <script> tag early and inject arbitrary markup --
// a stored XSS. Escaping "<" as its unicode form is the standard mitigation
// for embedding JSON inside an HTML <script> tag.
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
