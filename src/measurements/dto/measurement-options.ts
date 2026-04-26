export const MEASUREMENT_FIELD_INPUT_TYPES = [
  'TEXT',
  'NUMBER',
  'DECIMAL',
  'SELECT',
  'RADIO',
  'CHECKBOX',
  'TEXTAREA',
] as const;

export const MEASUREMENT_VERIFICATION_STATUSES = [
  'NOT_VERIFIED',
  'VERIFIED_OK',
  'NEEDS_UPDATE',
  'UPDATED',
] as const;

export type MeasurementFieldInputTypeValue =
  (typeof MEASUREMENT_FIELD_INPUT_TYPES)[number];

export type MeasurementVerificationStatusValue =
  (typeof MEASUREMENT_VERIFICATION_STATUSES)[number];
