/**
 * Helpers for reading Move object fields from gRPC/JSON-shaped `object.json` (snake_case) vs legacy RPC (camelCase in fields).
 */
export function pickField(obj: Record<string, unknown> | null | undefined, ...keys: string[]): unknown {
  if (!obj) return undefined;
  for (const k of keys) {
    if (k in obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

/** Unwrap common `{ fields: { ... } }` shape from Sui object JSON. */
export function moveObjectFields(json: unknown): Record<string, unknown> | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if ('fields' in o && typeof o.fields === 'object' && o.fields !== null) {
    return o.fields as Record<string, unknown>;
  }
  return o;
}

const SUI_OBJECT_ID_RE = /^0x[0-9a-fA-F]{64}$/;

function pushId(out: Set<string>, s: string) {
  if (SUI_OBJECT_ID_RE.test(s)) out.add(s);
}

/**
 * Collect object ID hex strings from Move JSON for `vector<ID>`, `VecSet<ID>`, or nested `contents` arrays
 * (gRPC / JSON-RPC both use `{ fields: { bytes: "0x..." } }` per ID).
 */
export function extractObjectIdsFromMoveValue(raw: unknown): string[] {
  const out = new Set<string>();

  const visit = (v: unknown): void => {
    if (v === null || v === undefined) return;
    if (typeof v === 'string') {
      pushId(out, v);
      return;
    }
    if (Array.isArray(v)) {
      for (const x of v) visit(x);
      return;
    }
    if (typeof v !== 'object') return;
    const o = v as Record<string, unknown>;

    if (typeof o.fields === 'object' && o.fields !== null) {
      const f = o.fields as Record<string, unknown>;
      if (typeof f.bytes === 'string') {
        pushId(out, f.bytes);
        return;
      }
      if (Array.isArray(f.contents)) {
        for (const x of f.contents) visit(x);
        return;
      }
    }

    if (Array.isArray(o.contents)) {
      for (const x of o.contents) visit(x);
    }
  };

  visit(raw);
  return Array.from(out);
}
