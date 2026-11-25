const { verifyWebhookSignature, toBuffer } = require('../utils/signature');
const { ArenyzeApiError, ArenyzeWebhookSignatureError } = require('../errors');

/** @typedef {import('../utils/signature').VerifyOptions} VerifyOptions */
/** @typedef {import('../../types/params-interfaces').DiscordWebhookOptions} DiscordWebhookOptions */
/** @typedef {import('../../types/result-interfaces').PlayerProfile} PlayerProfile */
/** @typedef {import('../../types/result-interfaces').WebhookEvent} WebhookEvent */
/** @typedef {import('../../types/result-interfaces').DiscordWebhookResult} DiscordWebhookResult */

/**
 * @typedef {{ name: string, value: string, inline: boolean }} DiscordEmbedField
 */

const SITE_URL = 'https://thefinals.arenyze.com';
const DEFAULT_COLOR = 0xd31f3c;
const DISCORD_WEBHOOK = /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+(?:\?.*)?$/;

/**
 * @param {number | null | undefined} n
 * @returns {string}
 */
function fmt(n) {
  return typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString('en-US') : 'N/A';
}

/**
 * Arenyze webhooks (receiving signed events) and Discord messages (sending a player card).
 */
class Webhooks {
  /**
   * @param {{ httpClient: { post: (url: string, data?: any) => Promise<{ headers: Record<string, string> }> } }} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Check the `Arenyze-Signature` header of a delivery.
   * @param {string | Buffer | Uint8Array} rawBody The body exactly as received.
   * @param {string | null | undefined} signatureHeader
   * @param {string} secret The endpoint secret (`whsec_…`).
   * @param {VerifyOptions} [options]
   * @returns {boolean}
   */
  verifySignature(rawBody, signatureHeader, secret, options) {
    return verifyWebhookSignature(rawBody, signatureHeader, secret, options);
  }

  /**
   * Verify a delivery and return the parsed event. Throws
   * `ArenyzeWebhookSignatureError` when the signature is wrong or too old.
   * @param {string | Buffer | Uint8Array} rawBody
   * @param {string | null | undefined} signatureHeader
   * @param {string} secret
   * @param {VerifyOptions} [options]
   * @returns {WebhookEvent}
   */
  constructEvent(rawBody, signatureHeader, secret, options) {
    if (!verifyWebhookSignature(rawBody, signatureHeader, secret, options)) {
      throw new ArenyzeWebhookSignatureError('Invalid or expired Arenyze webhook signature');
    }
    return JSON.parse(toBuffer(rawBody).toString('utf8'));
  }

  /**
   * Post a player card to a Discord channel webhook, built from
   * `players.getProfile()`. The API key is never sent to Discord.
   * @param {string} webhookUrl Discord channel webhook URL.
   * @param {PlayerProfile} profile
   * @param {DiscordWebhookOptions} [options]
   * @returns {Promise<DiscordWebhookResult>}
   */
  async createDiscordPlayerWebhook(webhookUrl, profile, options = {}) {
    if (!webhookUrl || !profile) {
      throw new TypeError('Missing required parameters: webhookUrl and profile are required');
    }
    if (!DISCORD_WEBHOOK.test(webhookUrl)) {
      throw new TypeError('Invalid Discord webhook URL format');
    }

    /** @type {{ embeds: any[], content?: string }} */
    const payload = { embeds: [this._createPlayerEmbed(profile, options)] };
    if (options.message) {
      payload.content = options.message;
    }

    try {
      const response = await this.client.httpClient.post(webhookUrl, payload);
      return {
        success: true,
        messageId: response.headers['x-discord-message-id'],
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ArenyzeApiError) {
        if (error.status === 404) {
          throw new ArenyzeApiError('Discord webhook not found - check the webhook URL', { status: 404, code: 'DISCORD_WEBHOOK_NOT_FOUND', body: error.body });
        }
        if (error.status === 401 || error.status === 403) {
          throw new ArenyzeApiError('Discord webhook unauthorized - the webhook may be deleted or disabled', { status: error.status, code: 'DISCORD_WEBHOOK_UNAUTHORIZED', body: error.body });
        }
        if (error.status === 429) {
          throw new ArenyzeApiError('Discord rate limit exceeded - try again later', { status: 429, code: 'DISCORD_RATE_LIMITED', body: error.body, headers: error.response.headers });
        }
      }
      throw error;
    }
  }

  /**
   * @param {PlayerProfile} profile
   * @param {DiscordWebhookOptions} options
   */
  _createPlayerEmbed(profile, options) {
    const name = profile.displayName || profile.embarkName || 'Unknown player';

    /** @type {DiscordEmbedField[]} */
    const fields = [
      {
        name: 'Ranked',
        value: profile.currentRank
          ? `**Rank:** #${fmt(profile.currentRank)}\n**League:** ${profile.currentLeague || 'N/A'}\n**Score:** ${fmt(profile.currentScore)}`
          : 'Not on the live board',
        inline: true,
      },
      {
        name: 'Best',
        value: `**Best rank:** ${profile.bestRank ? `#${fmt(profile.bestRank)}` : 'N/A'}\n**Boards:** ${Array.isArray(profile.appearances) ? profile.appearances.length : 0}`,
        inline: true,
      },
    ];

    const handles = [
      profile.steamName && `**Steam:** ${profile.steamName}`,
      profile.psnName && `**PSN:** ${profile.psnName}`,
      profile.xboxName && `**Xbox:** ${profile.xboxName}`,
    ].filter(Boolean);
    if (profile.clubTag || handles.length) {
      fields.push({
        name: 'Player',
        value: [profile.clubTag && `**Club:** ${profile.clubTag}`, ...handles].filter(Boolean).join('\n'),
        inline: true,
      });
    }

    return {
      title: options.title || name,
      url: profile.embarkName ? `${SITE_URL}/player/${encodeURIComponent(profile.embarkName)}` : SITE_URL,
      description: options.description || `THE FINALS stats for **${name}**`,
      color: options.color ?? DEFAULT_COLOR,
      fields,
      ...(options.avatarUrl ? { thumbnail: { url: options.avatarUrl } } : {}),
      footer: { text: 'THE FINALS · Arenyze' },
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = Webhooks;
