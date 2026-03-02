import { Part } from '@myrmidon/cadmus-core';

/**
 * A single text passage.
 */
export interface TextPassage {
  citation: string;
  tag?: string;
  features?: string[];
  text?: string;
  note?: string;
}

/**
 * The TextPassages part model.
 */
export interface TextPassagesPart extends Part {
  passages: TextPassage[];
}

/**
 * The type ID used to identify the TextPassagesPart type.
 */
export const TEXT_PASSAGES_PART_TYPEID = 'it.vedph.ndp.text-passages';

/**
 * JSON schema for the TextPassages part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const TEXT_PASSAGES_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/ndp/' + TEXT_PASSAGES_PART_TYPEID + '.json',
  type: 'object',
  title: 'TextPassagesPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'passages',
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
    passages: {
      type: 'array',
      items: {
        type: 'object',
        required: ['citation'],
        properties: {
          citation: {
            type: 'string',
          },
          tag: {
            type: 'string',
          },
          features: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          text: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
        },
      },
    },
  },
};
