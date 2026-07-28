import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  digestRows,
  parseInspectArgs,
  safeErrorDetails,
  writeRedactedReport,
} from './migrate-postgres-to-turso';

test('digest is deterministic regardless of input order and changes with values', () => {
  const first = { id: 'a', income: 10, dateMs: '1' };
  const second = { id: 'b', income: 20, dateMs: '2' };
  const columns = ['id', 'income', 'dateMs'];

  assert.equal(digestRows([first, second], columns), digestRows([second, first], columns));
  assert.notEqual(
    digestRows([first, second], columns),
    digestRows([first, { ...second, income: 21 }], columns),
  );
});

test('inspect CLI accepts the documented report form and rejects malformed arguments', () => {
  assert.deepEqual(parseInspectArgs(['--inspect-source']), { reportPath: undefined });
  assert.deepEqual(
    parseInspectArgs(['--inspect-source', '--report', '.local-migration/source.json']),
    { reportPath: '.local-migration/source.json' },
  );
  assert.throws(() => parseInspectArgs(['--inspect-source', '--report']), /Usage/);
  assert.throws(() => parseInspectArgs(['--copy']), /Usage/);
});

test('safe errors never include messages or connection details', () => {
  const error = Object.assign(
    new Error('connection failed with password=do-not-print'),
    { code: 'ETIMEDOUT' },
  );

  assert.deepEqual(safeErrorDetails(error), { name: 'Error', code: 'ETIMEDOUT' });
  assert.equal(JSON.stringify(safeErrorDetails(error)).includes('password'), false);
});

test('redacted report writer creates its parent and writes only the supplied report', async () => {
  const root = await mkdtemp(join(tmpdir(), 'moka-migration-report-'));
  const target = join(root, 'nested', 'source.json');
  const report = { source: 'redacted-postgresql', counts: { Finalist: '44' } };

  await writeRedactedReport(target, report);

  assert.deepEqual(JSON.parse(await readFile(target, 'utf8')), report);
});
