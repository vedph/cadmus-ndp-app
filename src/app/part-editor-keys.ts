import {
  ASSERTED_HISTORICAL_DATES_PART_TYPEID,
  BIBLIOGRAPHY_PART_TYPEID,
  CATEGORIES_PART_TYPEID,
  COMMENT_PART_TYPEID,
  CHRONOLOGY_FRAGMENT_TYPEID,
  CHRONOTOPES_PART_TYPEID,
  COMMENT_FRAGMENT_TYPEID,
  DECORATED_COUNTS_PART_TYPEID,
  DISTRICT_LOCATION_PART_TYPEID,
  DOC_REFERENCES_PART_TYPEID,
  EXTERNAL_IDS_PART_TYPEID,
  KEYWORDS_PART_TYPEID,
  HISTORICAL_DATE_PART_TYPEID,
  HISTORICAL_EVENTS_PART_TYPEID,
  INDEX_KEYWORDS_PART_TYPEID,
  METADATA_PART_TYPEID,
  NAMES_PART_TYPEID,
  NOTE_PART_TYPEID,
  PHYSICAL_MEASUREMENTS_PART_TYPEID,
  PHYSICAL_STATES_PART_TYPEID,
  PIN_LINKS_PART_TYPEID,
  TOKEN_TEXT_PART_TYPEID,
  PIN_LINKS_FRAGMENT_TYPEID,
} from '@myrmidon/cadmus-part-general-ui';
import {
  APPARATUS_FRAGMENT_TYPEID,
  ORTHOGRAPHY_FRAGMENT_TYPEID,
} from '@myrmidon/cadmus-part-philology-ui';
import { PartEditorKeys } from '@myrmidon/cadmus-core';

// bibliography
import { EXT_BIBLIOGRAPHY_PART_TYPEID } from '@myrmidon/cadmus-part-biblio-ui';

// geography
import { ASSERTED_LOCATIONS_PART_TYPEID } from '@myrmidon/cadmus-part-geo-asserted-locations';
import { ASSERTED_TOPONYMS_PART_TYPEID } from '@myrmidon/cadmus-part-geo-asserted-toponyms';

// epigraphy
import { EPI_SUPPORT_FRR_PART_TYPEID } from '@myrmidon/cadmus-part-epigraphy-support-frr';
import { EPI_SIGNS_PART_TYPEID } from '@myrmidon/cadmus-part-epigraphy-signs';

// codicology
import { COD_BINDINGS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-bindings';
import { COD_CONTENTS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-contents';
import { COD_DECORATIONS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-decorations';
import { COD_EDITS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-edits';
import { COD_HANDS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-hands';
import { COD_LAYOUTS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-layouts';
import { COD_MATERIAL_DSC_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-material-dsc';
import { COD_SHEET_LABELS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-sheet-labels';
import { COD_SHELFMARKS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-shelfmarks';
import { COD_WATERMARKS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-watermarks';

const GENERAL = 'general';
const PHILOLOGY = 'philology';
const GEOGRAPHY = 'geography';
const EPIGRAPHY = 'epigraphy';
const CODICOLOGY = 'codicology';
const BIBLIO = 'biblio';
const TOKEN_TEXT_LAYER_PART_TYPEID = 'it.vedph.token-text-layer';

/**
 * The parts and fragments editor keys for this UI.
 * Each property is a part type ID, mapped to a value of type PartGroupKey,
 * having a part property with the part's editor key, and a fragments property
 * with the mappings between fragment type IDs and their editor keys.
 */
export const PART_EDITOR_KEYS: PartEditorKeys = {
  // general
  [ASSERTED_HISTORICAL_DATES_PART_TYPEID]: {
    part: GENERAL,
  },
  [BIBLIOGRAPHY_PART_TYPEID]: {
    part: GENERAL,
  },
  [CATEGORIES_PART_TYPEID]: {
    part: GENERAL,
  },
  [COMMENT_PART_TYPEID]: {
    part: GENERAL,
  },
  [DECORATED_COUNTS_PART_TYPEID]: {
    part: GENERAL,
  },
  [DISTRICT_LOCATION_PART_TYPEID]: {
    part: GENERAL,
  },
  [DOC_REFERENCES_PART_TYPEID]: {
    part: GENERAL,
  },
  [HISTORICAL_DATE_PART_TYPEID]: {
    part: GENERAL,
  },
  [CHRONOTOPES_PART_TYPEID]: {
    part: GENERAL,
  },
  [EXTERNAL_IDS_PART_TYPEID]: {
    part: GENERAL,
  },
  [HISTORICAL_EVENTS_PART_TYPEID]: {
    part: GENERAL,
  },
  [INDEX_KEYWORDS_PART_TYPEID]: {
    part: GENERAL,
  },
  [KEYWORDS_PART_TYPEID]: {
    part: GENERAL,
  },
  [METADATA_PART_TYPEID]: {
    part: GENERAL,
  },
  [NAMES_PART_TYPEID]: {
    part: GENERAL,
  },
  [NOTE_PART_TYPEID]: {
    part: GENERAL,
  },
  [PHYSICAL_MEASUREMENTS_PART_TYPEID]: {
    part: GENERAL,
  },
  [PHYSICAL_STATES_PART_TYPEID]: {
    part: GENERAL,
  },
  [PIN_LINKS_PART_TYPEID]: {
    part: GENERAL,
  },
  [TOKEN_TEXT_PART_TYPEID]: {
    part: GENERAL,
  },
  // geography
  [ASSERTED_LOCATIONS_PART_TYPEID]: {
    part: GEOGRAPHY,
  },
  [ASSERTED_TOPONYMS_PART_TYPEID]: {
    part: GEOGRAPHY,
  },
  // epigraphy
  [EPI_SUPPORT_FRR_PART_TYPEID]: {
    part: EPIGRAPHY,
  },
  [EPI_SIGNS_PART_TYPEID]: {
    part: EPIGRAPHY,
  },
  // codicology
  [COD_BINDINGS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_CONTENTS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_DECORATIONS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_EDITS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_HANDS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_LAYOUTS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_MATERIAL_DSC_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_SHEET_LABELS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_SHELFMARKS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_WATERMARKS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  // bibliography
  [EXT_BIBLIOGRAPHY_PART_TYPEID]: {
    part: BIBLIO,
  },
  // layer parts
  [TOKEN_TEXT_LAYER_PART_TYPEID]: {
    part: GENERAL,
    fragments: {
      [CHRONOLOGY_FRAGMENT_TYPEID]: GENERAL,
      [COMMENT_FRAGMENT_TYPEID]: GENERAL,
      [APPARATUS_FRAGMENT_TYPEID]: PHILOLOGY,
      [ORTHOGRAPHY_FRAGMENT_TYPEID]: PHILOLOGY,
      [PIN_LINKS_FRAGMENT_TYPEID]: GENERAL,
    },
  },
};
