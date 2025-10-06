import { PartEditorKeys } from '@myrmidon/cadmus-core';

// general
import {
  ASSERTED_HISTORICAL_DATES_PART_TYPEID,
  BIBLIOGRAPHY_PART_TYPEID,
  CATEGORIES_PART_TYPEID,
  COMMENT_PART_TYPEID,
  DECORATED_COUNTS_PART_TYPEID,
  DISTRICT_LOCATION_PART_TYPEID,
  DOC_REFERENCES_PART_TYPEID,
  HISTORICAL_DATE_PART_TYPEID,
  CHRONOTOPES_PART_TYPEID,
  EXTERNAL_IDS_PART_TYPEID,
  HISTORICAL_EVENTS_PART_TYPEID,
  INDEX_KEYWORDS_PART_TYPEID,
  KEYWORDS_PART_TYPEID,
  METADATA_PART_TYPEID,
  NAMES_PART_TYPEID,
  NOTE_PART_TYPEID,
  PHYSICAL_MEASUREMENTS_PART_TYPEID,
  PHYSICAL_STATES_PART_TYPEID,
  PIN_LINKS_PART_TYPEID,
} from '@myrmidon/cadmus-part-general-ui';

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

// ndp-frac
import { COD_FR_LAYOUT_PART_TYPEID } from '@myrmidon/cadmus-part-ndpfrac-layout';
import { COD_FR_QUIRE_LABELS_PART_TYPEID } from '@myrmidon/cadmus-part-ndpfrac-quire-labels';
import { COD_FR_RULINGS_PART_TYPEID } from '@myrmidon/cadmus-part-ndpfrac-rulings';
import { COD_FR_SUPPORT_PART_TYPEID } from '@myrmidon/cadmus-part-ndpfrac-support';

// ndp-books
import { PRINT_FONTS_PART_TYPEID } from '@myrmidon/cadmus-part-ndpbooks-fonts';
import { PRINT_FIG_PLAN_IMPL_PART_TYPEID } from '@myrmidon/cadmus-part-ndpbooks-fig-plan';
import { PRINT_FIG_PLAN_PART_TYPEID } from '@myrmidon/cadmus-part-ndpbooks-fig-plan';

// iconography
import { ICO_INSTRUCTIONS_PART_TYPEID } from '@myrmidon/cadmus-part-iconography-instructions';

import { DRAWING_TECH_PART_TYPEID } from '@myrmidon/cadmus-part-ndpdrw-tech';

// route constants
const GENERAL = 'general';
const PHILOLOGY = 'philology';
const CODICOLOGY = 'codicology';
const ICONOGRAPHY = 'iconography';
const NDP_FRAC = 'ndp-frac';
const NDP_BOOKS = 'ndp-books';
const NDP_DRAWINGS = 'ndp-drawings';

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
  // ndp-frac
  [COD_FR_LAYOUT_PART_TYPEID]: {
    part: NDP_FRAC,
  },
  [COD_FR_QUIRE_LABELS_PART_TYPEID]: {
    part: NDP_FRAC,
  },
  [COD_FR_RULINGS_PART_TYPEID]: {
    part: NDP_FRAC,
  },
  [COD_FR_SUPPORT_PART_TYPEID]: {
    part: NDP_FRAC,
  },
  // ndp-books
  [PRINT_FONTS_PART_TYPEID]: {
    part: NDP_BOOKS,
  },
  [PRINT_FIG_PLAN_PART_TYPEID]: {
    part: NDP_BOOKS,
  },
  [PRINT_FIG_PLAN_IMPL_PART_TYPEID]: {
    part: NDP_BOOKS,
  },
  // ndp-drawings
  [DRAWING_TECH_PART_TYPEID]: {
    part: NDP_DRAWINGS,
  },
  // iconography
  [ICO_INSTRUCTIONS_PART_TYPEID]: {
    part: ICONOGRAPHY,
  },
};
