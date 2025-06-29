import { Part } from '@myrmidon/cadmus-core';

/**
 * The codicological fragment support part model.
 */
export interface CodFrSupportPart extends Part {
  material: string;
  location: string;
  layout: string;
  container: string;
  hasPricking?: boolean;
  reuse?: string;
  supposedReuse?: string;
}

/**
 * The type ID used to identify the CodFrSupportPart type.
 */
export const COD_FR_SUPPORT_PART_TYPEID = 'it.vedph.ndp.cod-fr-support';

/**
 * JSON schema for the CodFrSupportPart part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_FR_SUPPORT_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/ndpfrac/' + COD_FR_SUPPORT_PART_TYPEID + '.json',
  type: 'object',
  title: 'CodFrSupportPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'material',
    'location',
    'layout',
    'container',
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
    material: {
      type: 'string',
    },
    location: {
      type: 'string',
    },
    layout: {
      type: 'string',
    },
    container: {
      type: 'string',
    },
    hasPricking: {
      type: 'boolean',
    },
    reuse: {
      type: 'string',
    },
    supposedReuse: {
      type: 'string',
    },
  },
};
