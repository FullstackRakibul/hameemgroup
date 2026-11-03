/* ── The About section's denim dress form ──
   `model`: the 3D model (GLB, Draco optional, under 3 MB). When the file is
   there, the true 3D mode is used.
   `image`: a transparent cut-out (WebP, under 120 KB). It is the 3D model's
   loading poster, the 2.5D mode when there is no model, and the still for
   reduced motion. Either may be missing; the form then falls back, or shows
   nothing. */
export const DRESS_FORM = {
  image: "/media/models/denim-form.webp",
  model: "/media/models/denim-form.glb",
};
