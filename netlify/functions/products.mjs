const images = Array.isArray(p.images)
  ? p.images.map(String).map(x => x.trim()).filter(Boolean)
  : [String(p.image || "").trim()].filter(Boolean);

const product = {
  id: id(),
  name: String(p.name).trim(),
  price: Number(p.price),
  sizes: p.sizes.map(String).map(x => x.trim()).filter(Boolean),
  description: String(p.description || "").trim(),
  image: images[0] || "",
  images,
  active: true,
  created_at: new Date().toISOString()
};
