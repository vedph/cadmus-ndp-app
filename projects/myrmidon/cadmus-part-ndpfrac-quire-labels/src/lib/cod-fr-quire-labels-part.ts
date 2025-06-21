import { Part } from '@myrmidon/cadmus-core';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

/**
 * A label in CodFrQuireLabels part.
 */
export interface CodFrQuireLabel {
  positions: string[];
  types: string[];
  text?: string;
  handId?: AssertedCompositeId;
  ink?: string;
  note?: string;
}

/**
 * The CodFrQuireLabels part model for quire labels of
 * codicologcal fragments.
 */
export interface CodFrQuireLabelsPart extends Part {
  labels: CodFrQuireLabel[];
}

/**
 * The type ID used to identify the CodFrQuireLabelsPart type.
 */
export const COD_FR_QUIRE_LABELS_PART_TYPEID =
  'it.vedph.ndpfrac.cod-fr-quire-labels';

/**
 * JSON schema for the CodFrQuireLabels part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const CodFrQuireLabels_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/ndpfrac/' +
    COD_FR_QUIRE_LABELS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'CodFrQuireLabelsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'labels',
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
    labels: {
      type: 'array',
      items: {
        type: 'object',
        required: ['positions', 'types'],
        properties: {
          positions: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          types: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          text: {
            type: 'string',
          },
          handId: {
            type: 'object',
            properties: {
              target: {
                type: 'object',
                required: ['gid', 'label'],
                properties: {
                  gid: {
                    type: 'string',
                  },
                  label: {
                    type: 'string',
                  },
                  itemId: {
                    type: 'string',
                  },
                  partId: {
                    type: 'string',
                  },
                  partTypeId: {
                    type: 'string',
                  },
                  roleId: {
                    type: 'string',
                  },
                  name: {
                    type: 'string',
                  },
                  value: {
                    type: 'string',
                  },
                },
                additionalProperties: false,
              },
              scope: {
                type: 'string',
              },
              tag: {
                type: 'string',
              },
              assertion: {
                type: 'object',
                required: ['rank'],
                properties: {
                  rank: {
                    type: 'integer',
                  },
                  tag: {
                    type: 'string',
                  },
                  note: {
                    type: 'string',
                  },
                  references: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['citation'],
                      properties: {
                        type: {
                          type: 'string',
                        },
                        tag: {
                          type: 'string',
                        },
                        citation: {
                          type: 'string',
                        },
                        note: {
                          type: 'string',
                        },
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
          ink: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};
