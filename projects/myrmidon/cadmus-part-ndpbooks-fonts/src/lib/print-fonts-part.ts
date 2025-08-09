import { Part } from '@myrmidon/cadmus-core';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

/**
 * A font used for printing.
 */
export interface PrintFont {
  eid?: string;
  family: string;
  sections?: string[];
  features?: string[];
  ids?: AssertedCompositeId[];
  note?: string;
}

/**
 * The part model for the set of fonts used in a printed book.
 */
export interface PrintFontsPart extends Part {
  fonts: PrintFont[];
}

/**
 * The type ID used to identify the PrintFontsPart type.
 */
export const PRINT_FONTS_PART_TYPEID = 'it.vedph.ndp.print-fonts';

/**
 * JSON schema for the PrintFonts part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const PRINT_FONTS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/__PRJ__/__LIB__/' +
    PRINT_FONTS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'PrintFontsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'fonts',
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
    fonts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          eid: {
            type: 'string',
          },
          family: {
            type: 'string',
          },
          sections: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          features: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          ids: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tag: { type: 'string' },
                scope: { type: 'string' },
                gid: { type: 'string' },
                assertion: {
                  type: 'object',
                  properties: {
                    rank: { type: 'integer' },
                    note: { type: 'string' },
                    sources: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          citation: { type: 'string' },
                          tag: { type: 'string' },
                        },
                        required: ['citation'],
                      },
                    },
                  },
                  required: ['rank'],
                },
              },
              required: ['tag', 'scope', 'gid', 'assertion'],
            },
          },
        },
        required: ['family'],
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};
