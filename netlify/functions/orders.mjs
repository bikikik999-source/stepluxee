import { json, store, requireAdmin, id } from "./_shared.mjs";

export default async (req) => {
  const s = store();

  // KREIRANJE PORUDŽBINE
  if (req.method === "POST") {
    let o;

    try {
      o = await req.json();
    } catch {
      return json({ error: "Neispravan zahtev." }, 400);
    }

    if (
      !o.customer_name ||
      !o.phone ||
      !o.city ||
      !o.address ||
      !Array.isArray(o.items) ||
      !o.items.length
    ) {
      return json(
        { error: "Popunite podatke za dostavu." },
        400
      );
    }

    const order = {
      id: id(),
      customer_name: String(o.customer_name),
      phone: String(o.phone),
      city: String(o.city),
      address: String(o.address),
      note: String(o.note || ""),
      items: o.items,
      total: Number(o.total) || 0,
      status: "new",
      created_at: new Date().toISOString()
    };

    await s.setJSON(`order/${order.id}`, order);

    return json({ ok: true }, 201);
  }

  // ADMIN PROVJERA
  const auth = requireAdmin(req);
  if (auth) return auth;

  // UČITAVANJE PORUDŽBINA
  if (req.method === "GET") {
    const { blobs } = await s.list({
      prefix: "order/"
    });

    const out = [];

    for (const b of blobs) {
      const o = await s.get(b.key, {
        type: "json"
      });

      if (o) out.push(o);
    }

    out.sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );

    return json(out);
  }

  // PROMENA STATUSA PORUDŽBINE
  if (req.method === "PUT") {
    let body;

    try {
      body = await req.json();
    } catch {
      return json(
        { error: "Neispravan zahtev." },
        400
      );
    }

    const o = await s.get(
      `order/${body.id}`,
      { type: "json" }
    );

    if (!o) {
      return json(
        { error: "Porudžbina nije pronađena." },
        404
      );
    }

    o.status = String(
      body.status || o.status
    );

    await s.setJSON(
      `order/${o.id}`,
      o
    );

    return json(o);
  }

  return json(
    { error: "Method not allowed" },
    405
  );
};
