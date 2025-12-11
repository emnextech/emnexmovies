/**
 * API Constants and Configuration
 * Based on src/moviebox_api/constants.py
 */

const MIRROR_HOSTS = [
  "h5.aoneroom.com",
  "movieboxapp.in",
  "moviebox.pk",
  "moviebox.ph",
  "moviebox.id",
  "v.moviebox.ph",
  "netnaija.video",
];

const SELECTED_HOST = process.env.MOVIEBOX_API_HOST || `https://${MIRROR_HOSTS[0]}`;
const HOST_PROTOCOL = "https";
const HOST_URL = SELECTED_HOST.endsWith('/') ? SELECTED_HOST : `${SELECTED_HOST}/`;

const SUBJECT_TYPES = {
  ALL: 0,
  MOVIES: 1,
  TV_SERIES: 2,
  MUSIC: 6,
};

const DOWNLOAD_QUALITIES = [
  "WORST",
  "BEST",
  "360P",
  "480P",
  "720P",
  "1080P",
];

const DEFAULT_CAPTION_LANGUAGE = "English";

module.exports = {
  MIRROR_HOSTS,
  SELECTED_HOST,
  HOST_PROTOCOL,
  HOST_URL,
  SUBJECT_TYPES,
  DOWNLOAD_QUALITIES,
  DEFAULT_CAPTION_LANGUAGE,
};

