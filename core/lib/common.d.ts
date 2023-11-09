import { IncomingMessage } from 'http';

declare namespace common {
  function hashPassword(password: string): Promise<string>;
  function validatePassword(password: string, serHash: string): Promise<boolean>;
  function jsonParse(buffer: Buffer): object | null;
  function receiveBody(req: IncomingMessage): Promise<string>;

  interface ExcelJS { }

  interface fs { }

  function extractArguments(input: string): string[];
  function generateToken(id: string): string;
  function sendEmail(target: string, url: string): Promise<void>;
  function validateToken(token: string): { [key: string]: any } | { error: string };
  function validNumberValue(target: string | number): number | undefined;

  const API_VERSION: string;
  const Buffer: typeof Buffer;
  const cron: typeof import('node-cron');
  const ExcelJS: typeof import('exceljs');
  const fs: typeof import('node:fs');
  const fetch: typeof import('undici');
  const userStatusMap: Map<any, any>;
  const userTimeZoneMap: Map<any, any>;

  function getDaysByDates(from: string, to: string): number;
  function getEmailContent(contentPath: string, locale: string, type: string): { subject: string, content: string };
  function generateTempToken(): string;
  function splitObjectIntoArraysByField(object: any[], value: string): { [key: string]: any[] };
  function transformToPureDate(values: any[]): any;
}

export = common;
