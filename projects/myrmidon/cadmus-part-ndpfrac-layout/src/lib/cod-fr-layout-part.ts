import { Part } from '@myrmidon/cadmus-core';
import { PhysicalDimension } from '@myrmidon/cadmus-mat-physical-size';
import { DecoratedCount } from '@myrmidon/cadmus-refs-decorated-counts';

/**
 * The CodFrLayout part model.
 */
export interface CodFrLayoutPart extends Part {
  formula: string;
  dimensions?: PhysicalDimension[];
  pricking?: string;
  columnCount: number;
  counts?: DecoratedCount[];
  features?: string[];
  note?: string;
}

/**
 * The type ID used to identify the CodFrLayoutPart type.
 */
export const COD_FR_LAYOUT_PART_TYPEID = 'it.vedph.ndp.cod-fr-layout';

/**
 * JSON schema for the CodFrLayout part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_FR_LAYOUT_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/ndp/' + COD_FR_LAYOUT_PART_TYPEID + '.json',
  type: 'object',
  title: 'CodFrLayoutPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'formula',
    'columnCount',
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

    formula: {
      type: 'string',
    },
    dimensions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tag: { type: 'string' },
          value: { type: 'number' },
          unit: { type: 'string' },
        },
        required: ['value', 'unit'],
      },
    },
    pricking: {
      type: 'string',
    },
    columnCount: {
      type: 'integer',
      minimum: 1,
    },
    counts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          value: { type: 'integer' },
          note: { type: 'string' },
        },
        required: ['id', 'value'],
      },
    },
    features: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    note: {
      type: 'string',
    },
  },
};
