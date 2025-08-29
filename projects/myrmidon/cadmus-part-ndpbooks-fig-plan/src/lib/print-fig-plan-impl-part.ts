import { PhysicalSize } from '@myrmidon/cadmus-mat-physical-size';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

import { Part } from '@myrmidon/cadmus-core';
import { PrintFont } from '@myrmidon/cadmus-part-ndpbooks-fonts';

import { FigPlanItem } from './print-fig-plan-part';

/**
 * A label for a figurative plan item.
 */
export interface FigPlanItemLabel {
  /**
   * The type of label, e.g. legend, topographic indication, etc.
   * Usually from thesaurus "fig-plan-item-label-types".
   */
  type: string;

  /**
   * The language(s) used in the label.
   * Usually from thesaurus "fig-plan-item-label-languages".
   */
  languages?: string[];

  /**
   * The label value, e.g. the legend text, the character
   * name, etc.
   */
  value?: string;

  /**
   * A free text note about the label.
   */
  note?: string;

  /**
   * The fonts used in the label.
   */
  fonts?: PrintFont[];
}

/**
 * Implementation of a figurative plan item.
 */
export interface FigPlanImplItem extends FigPlanItem {
  /**
   * The page location (e.g. "1r").
   */
  location?: string;

  /**
   * The type of change made to the item in this instance
   * with respect to the plan.
   * Usually from thesaurus "fig-plan-impl-change-types".
   */
  changeType?: string;

  /**
   * Any relevant features of the implemented item (e.g.
   * matrix change, frame removed, etc.).
   * Usually from thesaurus "fig-plan-impl-item-features".
   */
  features?: string[];

  /**
   * The type of matrix used for this item. Usually from thesaurus
   * "fig-plan-impl-matrix-types".
   */
  matrixType?: string;

  /**
   * The state of the matrix (e.g. a woodblock) used for this item.
   * Usually from thesaurus "fig-plan-impl-matrix-states".
   */
  matrixState?: string;

  /**
   * A free textual description of the matrix state, if any.
   */
  matrixStateDsc?: string;

  /**
   * The relative position of the item in the page
   * (e.g. in-text, upper margin, etc.).
   * Usually from thesaurus "fig-plan-impl-positions".
   */
  position?: string;

  /**
   * The size of the item.
   */
  size?: PhysicalSize;

  /**
   * Labels for this item, e.g. a legend, a character name, etc.
   */
  labels?: FigPlanItemLabel[];

  /**
   * A free text description about all the labels of this item.
   */
  labelDsc?: string;

  /**
   * The iconography of this item, if any.
   */
  iconographyId?: AssertedCompositeId;
}

/**
 * The printed book's figurative plan part model.
 */
export interface PrintFigPlanImplPart extends Part {
  isComplete?: boolean;
  techniques: string[];
  items?: FigPlanImplItem[];
  description?: string;
  features?: string[];
}

/**
 * The type ID used to identify the PrintFigPlanImplPart type.
 */
export const PRINT_FIG_PLAN_IMPL_PART_TYPEID =
  'it.vedph.ndp.print-fig-plan-impl';

/**
 * JSON schema for the PrintFigPlanImpl part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const PRINT_FIG_PLAN_IMPL_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/ndp/' +
    PRINT_FIG_PLAN_IMPL_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'PrintFigPlanImplPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'techniques',
  ],
  properties: {
    timeCreated: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    creatorId: {
      type: 'string',
    },
    timeModified: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    userId: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    itemId: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    typeId: {
      type: 'string',
      pattern: '^[a-z][-0-9a-z._]*$',
    },
    roleId: {
      type: ['string', 'null'],
      pattern: '^([a-z][-0-9a-z._]*)?$',
    },
    isComplete: {
      type: 'boolean',
    },
    techniques: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['eid', 'type'],
        properties: {
          eid: { type: 'string' },
          type: { type: 'string' },
          citation: { type: 'string' },
          location: { type: 'string' },
          changeType: { type: 'string' },
          features: {
            type: 'array',
            items: { type: 'string' },
          },
          matrixType: { type: 'string' },
          matrixState: { type: 'string' },
          matrixStateDsc: { type: 'string' },
          position: { type: 'string' },
          size: {
            type: 'object',
            properties: {
              w: { type: 'number' },
              h: { type: 'number' },
              unit: { type: 'string' },
              tag: { type: 'string' },
            },
            required: [],
            additionalProperties: false,
          },
          labels: {
            type: 'array',
            items: {
              type: 'object',
              required: ['type'],
              properties: {
                type: { type: 'string' },
                languages: {
                  type: 'array',
                  items: { type: 'string' },
                },
                value: { type: 'string' },
                note: { type: 'string' },
                fonts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['family'],
                    properties: {
                      eid: { type: 'string' },
                      family: { type: 'string' },
                      sections: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                      features: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                      ids: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['tag', 'scope', 'gid', 'assertion'],
                          properties: {
                            tag: { type: 'string' },
                            scope: { type: 'string' },
                            gid: { type: 'string' },
                            assertion: {
                              type: 'object',
                              required: ['rank'],
                              properties: {
                                rank: { type: 'integer' },
                                note: { type: 'string' },
                                sources: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    required: ['citation'],
                                    properties: {
                                      citation: { type: 'string' },
                                      tag: { type: 'string' },
                                    },
                                    additionalProperties: false,
                                  },
                                },
                              },
                              additionalProperties: false,
                            },
                          },
                          additionalProperties: false,
                        },
                      },
                      note: { type: 'string' },
                    },
                    additionalProperties: false,
                  },
                },
              },
              additionalProperties: false,
            },
          },
          labelDsc: { type: 'string' },
          iconographyId: {
            type: 'object',
            required: ['tag', 'scope', 'gid', 'assertion'],
            properties: {
              tag: { type: 'string' },
              scope: { type: 'string' },
              gid: { type: 'string' },
              assertion: {
                type: 'object',
                required: ['rank'],
                properties: {
                  rank: { type: 'integer' },
                  note: { type: 'string' },
                  sources: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['citation'],
                      properties: {
                        citation: { type: 'string' },
                        tag: { type: 'string' },
                      },
                      additionalProperties: false,
                    },
                  },
                },
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    },
    description: { type: 'string' },
    features: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  additionalProperties: false,
};
