const Resource = require('./Resource');
const { segment } = require('../utils/buildUrl');
const { requireString, optionalOneOf } = require('../utils/validate');

/** @typedef {import('../../types/base-types').ItemSection} ItemSection */
/** @typedef {import('../../types/params-interfaces').ItemSearchParams} ItemSearchParams */
/** @typedef {import('../../types/result-interfaces').ItemSections} ItemSections */
/** @typedef {import('../../types/result-interfaces').ItemSectionList} ItemSectionList */
/** @typedef {import('../../types/result-interfaces').ItemDetail} ItemDetail */
/** @typedef {import('../../types/result-interfaces').ItemSearchResult} ItemSearchResult */
/** @typedef {import('../../types/result-interfaces').CosmeticFacets} CosmeticFacets */
/** @typedef {import('../../types/result-interfaces').MetaLoadouts} MetaLoadouts */

/** @type {readonly ItemSection[]} */
const SECTIONS = ['weapons', 'gadgets', 'specializations', 'maps', 'modes', 'sponsors', 'cosmetics'];

/**
 * @param {ItemSection} section
 * @returns {ItemSection}
 */
function sectionOf(section) {
  const value = optionalOneOf(/** @type {ItemSection} */ (requireString(section, 'section')), 'section', SECTIONS);
  return /** @type {ItemSection} */ (value);
}

/** The item database: weapons, gadgets, specializations, maps, modes, sponsors and cosmetics. */
class Items {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Every section with counts and previews.
   * @returns {Promise<ItemSections>}
   */
  async getSections() {
    return this._r._get('/items');
  }

  /**
   * Every item of a section with stats and images.
   * @param {ItemSection} section
   * @returns {Promise<ItemSectionList>}
   */
  async getSection(section) {
    return this._r._get(`/items/${sectionOf(section)}`);
  }

  /**
   * Full detail of one item: damage, fire rate, magazine, class, images.
   * @param {ItemSection} section
   * @param {string} slug Item slug, e.g. `akm`.
   * @returns {Promise<ItemDetail>}
   */
  async getItem(section, slug) {
    return this._r._get(`/items/${sectionOf(section)}/${segment(requireString(slug, 'slug'))}`);
  }

  /**
   * Search across the whole item database.
   * @param {ItemSearchParams} params
   * @returns {Promise<ItemSearchResult>}
   */
  async searchItems(params) {
    return this._r._get('/items/search', {
      q: requireString(params?.q, 'q'),
      kind: params.kind,
      limit: params.limit,
    });
  }

  /**
   * Rarities, slots and sources available to filter cosmetics.
   * @returns {Promise<CosmeticFacets>}
   */
  async getCosmeticFacets() {
    return this._r._get('/items/cosmetics/facets');
  }

  /**
   * Loadouts shared by the community, with votes.
   * @returns {Promise<any>}
   */
  async getLoadouts() {
    return this._r._get('/loadouts');
  }

  /**
   * The most used builds of each class.
   * @returns {Promise<MetaLoadouts>}
   */
  async getMetaLoadouts() {
    return this._r._get('/loadouts/meta');
  }
}

module.exports = Items;
