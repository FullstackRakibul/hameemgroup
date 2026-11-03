/* Shared by DressForm3D and its three.js scene, so the component can lay out
   the floor without importing (and bundling) three. */

/** The model's height takes 1 / FRAME of the view, centred */
export const FRAME = 1.15;
export const FOV = 30;
/** Where the model's feet stand, as a fraction of the view's height from the bottom */
export const FLOOR = (1 - 1 / FRAME) / 2;
