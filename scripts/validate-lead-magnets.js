#!/usr/bin/env node

/**
 * Lead Magnet Content Validation Script
 *
 * Validates markdown/mdx files for:
 * - HTML comments (must use JSX comments)
 * - MDX syntax issues (curly braces, angle brackets)
 * - Frontmatter completeness
 * - File naming conventions
 *
 * Usage:
 *   node scripts/validate-lead-magnets.js                    # Validate all
 *   node scripts/validate-lead-magnets.js path/to/file.md    # Single file
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
/* eslint-enable @typescript-eslint/no-require-imports */

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  gray: '\x1b[90m',
};

const icons = {
  error: '🔴',
  warning: '🟡',
  success: '✅',
};

class ValidationResult {
  constructor(filePath) {
    this.filePath = filePath;
    this.errors = [];
    this.warnings = [];
  }

  addError(message, line = null) {
    this.errors.push({ message, line });
  }

  addWarning(message, line = null) {
    this.warnings.push({ message, line });
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasIssues() {
    return this.errors.length > 0 || this.warnings.length > 0;
  }

  print() {
    const filename = path.relative(process.cwd(), this.filePath);

    if (!this.hasIssues()) {
      console.log(`${icons.success} ${colors.green}${filename}${colors.reset}`);
      return;
    }

    console.log(`\n${colors.gray}${'─'.repeat(80)}${colors.reset}`);
    console.log(`📄 ${colors.blue}${filename}${colors.reset}`);
    console.log(`${colors.gray}${'─'.repeat(80)}${colors.reset}`);

    if (this.errors.length > 0) {
      this.errors.forEach(({ message, line }) => {
        const location = line ? ` ${colors.gray}(line ${line})${colors.reset}` : '';
        console.log(`  ${icons.error} ${colors.red}ERROR${colors.reset}: ${message}${location}`);
      });
    }

    if (this.warnings.length > 0) {
      this.warnings.forEach(({ message, line }) => {
        const location = line ? ` ${colors.gray}(line ${line})${colors.reset}` : '';
        console.log(`  ${icons.warning} ${colors.yellow}WARNING${colors.reset}: ${message}${location}`);
      });
    }
  }
}

function validateFile(filePath) {
  const result = new ValidationResult(filePath);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Parse frontmatter
    const frontmatter = parseFrontmatter(content);
    const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

    // Run all validations
    validateHTMLComments(content, result);
    validateFrontmatter(frontmatter, result);
    validateLocale(filePath, frontmatter, result);
    validateMDXSyntax(bodyContent, result);
    validateCodeBlocks(bodyContent, result);

  } catch (error) {
    result.addError(`Failed to read or parse file: ${error.message}`);
  }

  return result;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatterText = match[1];
  const frontmatter = {};
  const lines = frontmatterText.split('\n');

  let currentKey = null;
  let currentArray = null;

  lines.forEach(line => {
    // Array item
    if (line.trim().startsWith('-') && currentArray !== null) {
      const item = line.trim().substring(1).trim().replace(/^["']|["']$/g, '');
      currentArray.push(item);
      return;
    }

    // Key: value line
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      value = value.replace(/^["']|["']$/g, '');

      // Inline array
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        frontmatter[key] = value;
        currentKey = null;
        currentArray = null;
      }
      // Multi-line array start
      else if (value === '') {
        currentKey = key;
        currentArray = [];
        frontmatter[key] = currentArray;
      }
      // Regular value
      else {
        frontmatter[key] = value;
        currentKey = null;
        currentArray = null;
      }
    }
  });

  return frontmatter;
}

function validateHTMLComments(content, result) {
  const lines = content.split('\n');
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Track code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) return;

    // ERROR: HTML comment with backslash escape (the exact bug we had!)
    if (line.match(/<\\!--/)) {
      result.addError(
        'Invalid HTML comment with backslash: "<\\!--". Use JSX comment: {/* */}',
        lineNum
      );
    }

    // ERROR: Standard HTML comment
    if (line.match(/<!--[\s\S]*?-->/)) {
      result.addError(
        'HTML comments not supported in MDX. Use JSX comment: {/* */}',
        lineNum
      );
    }

    // ERROR: Unclosed HTML comment start
    if (line.match(/<!--/) && !line.match(/-->/)) {
      result.addError(
        'HTML comment detected. Use JSX comment: {/* */}',
        lineNum
      );
    }
  });
}

function validateFrontmatter(frontmatter, result) {
  if (!frontmatter) {
    result.addError('No frontmatter found. Frontmatter is required.');
    return;
  }

  // ERROR: Required fields for lead magnets
  const required = [
    'content_id',
    'title',
    'description',
    'category',
    'tags',
    'difficulty',
    'version',
    'published',
    'locale',
    'order',
    'lastUpdated',
    'author'
  ];

  required.forEach(field => {
    if (!frontmatter[field]) {
      result.addError(`Missing required frontmatter field: "${field}"`);
    }
  });

  // WARNING: Description length (SEO)
  if (frontmatter.description) {
    const length = frontmatter.description.length;
    if (length > 160) {
      result.addWarning(`Description too long (${length} chars). Recommended: under 160 for SEO.`);
    }
  }

  // WARNING: Tag count
  if (frontmatter.tags) {
    const tagCount = Array.isArray(frontmatter.tags) ? frontmatter.tags.length : 0;
    if (tagCount < 4) {
      result.addWarning(`Only ${tagCount} tags. Recommended: 4-8 tags for better discoverability.`);
    } else if (tagCount > 8) {
      result.addWarning(`Too many tags (${tagCount}). Recommended: 4-8 tags.`);
    }
  }

  // ERROR: Valid difficulty level
  if (frontmatter.difficulty) {
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(frontmatter.difficulty)) {
      result.addError(
        `Invalid difficulty: "${frontmatter.difficulty}". Must be: beginner, intermediate, or advanced.`
      );
    }
  }

  // ERROR: Valid locale
  if (frontmatter.locale) {
    const validLocales = ['en', 'es'];
    if (!validLocales.includes(frontmatter.locale)) {
      result.addError(
        `Invalid locale: "${frontmatter.locale}". Must be: en or es.`
      );
    }
  }
}

function validateLocale(filePath, frontmatter, result) {
  const filename = path.basename(filePath);

  // ERROR: Filename must have locale
  if (!filename.match(/\.(en|es)\.(md|mdx)$/)) {
    result.addError(
      `Filename must include locale: "${filename}" should be "*.en.md" or "*.es.md"`
    );
  }

  // WARNING: Locale mismatch between filename and frontmatter
  const filenameLocale = filename.match(/\.(en|es)\./)?.[1];
  if (frontmatter?.locale && filenameLocale && frontmatter.locale !== filenameLocale) {
    result.addWarning(
      `Locale mismatch: filename has "${filenameLocale}" but frontmatter has "${frontmatter.locale}"`
    );
  }
}

function validateMDXSyntax(content, result) {
  const lines = content.split('\n');
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Track code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) return;

    // ERROR: Unescaped curly braces (excluding JSX comments)
    if (!line.includes('{/*') && !line.includes('*/}')) {
      const curlyMatch = line.match(/[^`]{([^}]+)}[^`]/);
      if (curlyMatch && !line.trim().startsWith('```')) {
        result.addError(
          `Unescaped curly braces: "${curlyMatch[1]}". Wrap in backticks: \`{${curlyMatch[1]}}\``,
          lineNum
        );
      }
    }

    // ERROR: Unescaped angle brackets before text
    if (line.match(/<\s*[a-zA-Z_$]/) && !line.includes('`<')) {
      result.addError(
        'Unescaped angle bracket before text. Wrap in backticks or use &lt;',
        lineNum
      );
    }

    // ERROR: Unescaped < before numbers
    if (line.match(/<\s*\d/) && !line.includes('`<')) {
      result.addError(
        'Unescaped "<" before number. Use &lt; or wrap in backticks: `< 10`',
        lineNum
      );
    }
  });
}

function validateCodeBlocks(content, result) {
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      const lang = line.trim().substring(3);

      // ERROR: Placeholder language
      if (lang.includes('[') || lang.toLowerCase() === 'language') {
        result.addError(
          `Invalid code block language: "${lang}". Use actual language (bash, typescript, etc).`,
          index + 1
        );
      }

      // WARNING: Missing language
      if (!lang && line.trim() === '```') {
        result.addWarning(
          'Code block without language. Add language for syntax highlighting (bash, js, etc).',
          index + 1
        );
      }
    }
  });
}

function getFilesToValidate(args) {
  // Single file specified
  if (args.length > 0 && !args[0].startsWith('--')) {
    return [path.resolve(args[0])];
  }

  // Scan all lead magnet folders
  const files = [];
  const rootDir = process.cwd();

  fs.readdirSync(rootDir, { withFileTypes: true }).forEach(entry => {
    if (!entry.isDirectory()) return;

    // Skip hidden dirs, node_modules, scripts, etc
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'scripts') {
      return;
    }

    const folderPath = path.join(rootDir, entry.name);

    // Look for .md and .mdx files in this folder
    try {
      fs.readdirSync(folderPath).forEach(file => {
        if (file.match(/\.(md|mdx)$/) && !file.match(/README/i)) {
          files.push(path.join(folderPath, file));
        }
      });
    } catch (error) {
      // Skip if can't read directory
    }
  });

  return files;
}

function main() {
  const args = process.argv.slice(2);

  console.log(`\n${colors.blue}🔍 Lead Magnet Content Validator${colors.reset}`);
  console.log(`${colors.gray}${'═'.repeat(80)}${colors.reset}\n`);

  const files = getFilesToValidate(args);

  if (files.length === 0) {
    console.log(`${colors.yellow}No lead magnet files to validate.${colors.reset}\n`);
    process.exit(0);
  }

  console.log(`Validating ${files.length} file${files.length > 1 ? 's' : ''}...\n`);

  const results = files.map(validateFile);

  // Print results
  results.forEach(result => result.print());

  // Summary
  console.log(`\n${colors.gray}${'═'.repeat(80)}${colors.reset}`);

  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const filesWithIssues = results.filter(r => r.hasIssues()).length;
  const filesClean = results.length - filesWithIssues;

  console.log(`\n📊 ${colors.blue}Summary${colors.reset}:`);
  console.log(`  ${icons.success} ${filesClean} file${filesClean !== 1 ? 's' : ''} passed`);
  if (filesWithIssues > 0) {
    console.log(`  ❌ ${filesWithIssues} file${filesWithIssues !== 1 ? 's' : ''} with issues`);
  }
  console.log(`  ${icons.error} ${totalErrors} error${totalErrors !== 1 ? 's' : ''}`);
  console.log(`  ${icons.warning} ${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`);

  console.log('');

  // Exit code
  if (totalErrors > 0) {
    console.log(`${colors.red}❌ Validation failed with errors.${colors.reset}\n`);
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(`${colors.yellow}⚠️  Validation passed with warnings.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.green}✅ All validations passed!${colors.reset}\n`);
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateFile, ValidationResult };
