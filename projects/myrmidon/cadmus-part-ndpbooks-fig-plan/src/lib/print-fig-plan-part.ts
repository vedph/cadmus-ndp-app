import { Part } from '@myrmidon/cadmus-core';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

/**
 * An item of a print figurative plan.
 */
export interface FigPlanItem {
  eid: string;
  type: string;
  citation?: string;
}

/**
 * The printed book figurative plan part model.
 */
export interface PrintFigPlanPart extends Part {
  artistIds?: AssertedCompositeId[];
  techniques: string[];
  items?: FigPlanItem[];
  description?: string;
  features?: string[];
}

/**
 * The type ID used to identify the PrintFigPlanPart type.
 */
export const PRINT_FIG_PLAN_PART_TYPEID = 'it.vedph.ndp.print-fig-plan';

/**
 * JSON schema for the PrintFigPlan part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const PRINT_FIG_PLAN_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/ndp/' + PRINT_FIG_PLAN_PART_TYPEID + '.json',
  type: 'object',
  title: 'PrintFigPlanPart',
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
    artistIds: {
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
    techniques: {
      type: 'array',
      items: {
        type: 'string',
      },
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
        },
      },
    },
    description: {
      type: 'string',
    },
    features: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};
