import { json, store, requireAdmin, id } from "./_shared.mjs";

async function allProducts() {
  const s = store();
  const { blobs } = await s.list({ prefix: "product/" });
  const out = [];

  for (const b of blobs) {
    const p = await s.get(b.key, { type: "json" });
    if (p) out.push(p);
  }

  return out.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

export default async (req) => {
  if (req.method === "GET") {
    const products = (await allProducts()).filter(
      p => p.active !== false
    );
    return json(products);
  }

  const auth = requireAdmin(req);
  if (auth) return auth;

  const s = store();

  if (req.method === "POST") {
    let p;

    try {
      p = await req.json();
    } catch {
      return json({ error: "Neispravan zahtev." }, 400);
    }

    if (
      !p.name ||
      !Number.isFinite(Number(p.price)) ||
      !Array.isArray(p.sizes)
    ) {
      return json(
        { error: "Popunite naziv, cenu i veličine." },
        400
      );
    }

    const images = Array.isArray(p.images)
      ? p.images.map(String).map(x => x.trim()).filter(Boolean)
      : [String(p.image || "").trim()].filter(Boolean);

    if (!images.length) {
      return json(
        { error: "Dodajte bar jednu sliku." },
        400
      );
    }

    const product = {
      id: id(),
      name: String(p.name).trim(),
      price: Number(p.price),
      sizes: p.sizes
        .map(String)
        .map(x => x.trim())
        .filter(Boolean),
      description: String(p.description || "").trim(),
      image: images[0],
      images: images,
      active: true,
      created_at: new Date().toISOString()
    };

    await s.setJSON(`product/${product.id}`, product);

    return json(product, 201);
  }

  if (req.method === "PUT") {
    let p;

    try {
      p = await req.json();
    } catch {
      return json({ error: "Neispravan zahtev." }, 400);
    }

    if (!p.id) {
      return json({ error: "Nedostaje ID." }, 400);
    }

    const key = `product/${p.id}`;
    const old = await s.get(key, { type: "json" });

    if (!old) {
      return json(
        { error: "Proizvod nije pronađen." },
        404
      );
    }

    const updated = {
      ...old,
      ...p,
      id: old.id,
      created_at: old.created_at
    };

    if (Array.isArray(p.images)) {
      updated.images = p.images
        .map(String)
        .map(x => x.trim())
        .filter(Boolean);

      updated.image = updated.images[0] || old.image || "";
    }

    await s.setJSON(key, updated);

    return json(updated);
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const productId = url.searchParams.get("id");

    if (!productId) {
      return json({ error: "Nedostaje ID." }, 400);
    }

    await s.delete(`product/${productId}`);

    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
};
