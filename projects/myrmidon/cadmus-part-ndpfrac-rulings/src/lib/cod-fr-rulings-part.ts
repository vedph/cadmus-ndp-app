import { Part } from '@myrmidon/cadmus-core';

/**
 * Ruling for a codicological fragment.
 */
export interface CodFrRuling {
  features: string[];
  type?: string;
  system?: string;
  note?: string;
}

/**
 * The CodFrRulings part model.
 */
export interface CodFrRulingsPart extends Part {
  rulings: CodFrRuling[];
}

/**
 * The type ID used to identify the CodFrRulingsPart type.
 */
export const COD_FR_RULINGS_PART_TYPEID = 'it.vedph.ndp.cod-fr-rulings';

/**
 * JSON schema for the CodFrRulings part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_FR_RULINGS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/ndpfrac/' + COD_FR_RULINGS_PART_TYPEID + '.json',
  type: 'object',
  title: 'CodFrRulingsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'rulings',
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
    rulings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['features'],
        properties: {
          features: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          type: {
            type: 'string',
          },
          system: {
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
};
