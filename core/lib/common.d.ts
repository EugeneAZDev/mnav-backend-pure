import { IncomingMessage } from 'http';

declare namespace common {
  function hashPassword(password: string): Promise<string>;
  function validatePassword(password: string, serHash: string): Promise<boolean>;
  function jsonParse(buffer: Buffer): object | null;
  function receiveBody(req: IncomingMessage): Promise<string>;

  interface ExcelJS {}

  interface fs {}

  function extractArguments(input: string): string[];
  function generateToken(id: string): string;
  function sendEmail(target: string, url: string): Promise<void>;
  function validateToken(token: string): { [key: string]: any } | { error: string };
  function validNumberValue(target: string | number): number | undefined;
}

export = common;
