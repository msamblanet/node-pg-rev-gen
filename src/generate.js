#!/usr/bin/env node

import process from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import JSON5 from 'json5';

// Need to obtain __dirname - see https://bobbyhadz.com/blog/javascript-dirname-is-not-defined-in-es-module-scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __packageFile = path.resolve(__dirname, '..', 'package.json');

const __packageJson = JSON.parse(await fs.readFile(__packageFile), { encoding: 'utf8' });

const cachedTemplates = {};

async function loadTemplate(name) {
  // console.log(name);

  const templateFileName = path.resolve(__dirname, 'views', name);
  const templateText = await fs.readFile(templateFileName, { encoding: 'utf8' });

  return Handlebars.compile(templateText, { noEscape: true });
}

async function render(name, data, out) {
  cachedTemplates[name] ??= loadTemplate(name);
  const template = await cachedTemplates[name];
  const rendered = template(data, {});

  if (out) {
    await fs.writeFile(out, rendered, { encoding: 'utf8' });
    console.log(name, 'rendered to', out);
  }

  return rendered;
}

async function initHandlebars() {
  Handlebars.registerHelper('now', () => new Date());
  for await (const dir of await fs.opendir(path.join(__dirname, 'views', 'partials'))) {
    if (dir.isFile() && dir.name.endsWith('.hbs')) {
      const partialFile = path.join('partials', dir.name);
      const partial = await loadTemplate(partialFile);
      Handlebars.registerPartial(dir.name.slice(0, -4), partial);
    }
  }

  Handlebars.registerHelper('reverseArray', array => [...array].reverse());
  Handlebars.registerHelper('packageVersion', () => __packageJson.version ?? 'unknown');
}

async function generate(data) {
  await initHandlebars();
  await Promise.all([
    data.createFileName ? render('create.hbs', data, data.createFileName) : undefined,
    data.dropFileName ? render('dropAll.hbs', data, data.dropFileName) : undefined,
    data.dropTransientFileName ? render('dropTransient.hbs', data, data.dropTransientFileName) : undefined
  ]);
}

if (process.argv.length !== 3) {
  console.error('Usage: generateRevSql <path-to-json-config>');
  process.exit(255);
}

const dataFile = process.argv[2];
const dataFileName = path.resolve(dataFile);
console.log('Loading config from', dataFileName);
const data = JSON5.parse(await fs.readFile(dataFileName, { encoding: 'utf8' }));
await generate(data);
console.log('Complete');
