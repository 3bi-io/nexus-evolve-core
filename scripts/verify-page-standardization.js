#!/usr/bin/env node

/**
 * Script to verify all pages follow PageLayout standardization
 * Run with: node scripts/verify-page-standardization.js
 */

const fs = require('fs');
const path = require('path');

// Pages directory
const PAGES_DIR = path.join(__dirname, '../src/pages');

// Pages that should be excluded from standardization
const EXCLUDED_PAGES = [
  'Index.tsx',
  'Landing.tsx',
  'Auth.tsx',
  'NotFound.tsx',
];

// Mobile pages should have proper mobile props
const MOBILE_PAGES = [
  'Account.tsx',
  'Achievements.tsx',
  'AgentStudio.tsx',
  'MemoryGraph.tsx',
  'ProblemSolver.tsx',
  'Referrals.tsx',
];

// Stats tracking
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function readPageFile(filename) {
  const filePath = path.join(PAGES_DIR, filename);
  return fs.readFileSync(filePath, 'utf-8');
}

function getAllPageFiles() {
  return fs.readdirSync(PAGES_DIR)
    .filter(file => file.endsWith('.tsx'))
    .filter(file => !EXCLUDED_PAGES.includes(file));
}

function testPageLayout(filename, content) {
  const tests = [];
  
  // Test 1: Should import PageLayout
  tests.push({
    name: 'Imports PageLayout',
    pass: content.includes("from '@/components/layout/PageLayout'") ||
          content.includes('from "@/components/layout/PageLayout"'),
  });
  
  // Test 2: Should import SEO
  tests.push({
    name: 'Imports SEO component',
    pass: content.includes("from '@/components/SEO'") ||
          content.includes('from "@/components/SEO"'),
  });
  
  // Test 3: Should NOT import Helmet
  tests.push({
    name: 'No Helmet import (replaced by SEO)',
    pass: !content.includes("from 'react-helmet-async'") &&
          !content.includes('from "react-helmet-async"'),
  });
  
  // Test 4: Should use SEO component
  tests.push({
    name: 'Uses <SEO> component',
    pass: content.includes('<SEO'),
  });
  
  // Test 5: Should use PageLayout component
  tests.push({
    name: 'Uses <PageLayout> component',
    pass: content.includes('<PageLayout'),
  });
  
  // Test 6: Should have canonical URL
  const seoMatch = content.match(/<SEO[\s\S]*?\/>/);
  tests.push({
    name: 'Has canonical URL',
    pass: seoMatch && seoMatch[0].includes('canonical=') && 
          seoMatch[0].includes('https://oneiros.me/'),
  });
  
  // Test 7: Should have title in SEO
  tests.push({
    name: 'Has SEO title',
    pass: seoMatch && seoMatch[0].includes('title='),
  });
  
  // Test 8: Should have description in SEO
  tests.push({
    name: 'Has SEO description',
    pass: seoMatch && seoMatch[0].includes('description='),
  });
  
  // Test 9: Should have container classes
  tests.push({
    name: 'Has container classes',
    pass: content.includes('container') && content.includes('max-w-'),
  });
  
  // Test 10: Should have responsive padding
  tests.push({
    name: 'Has responsive padding',
    pass: content.includes('px-4') || content.includes('py-6') || 
          content.includes('md:py-8'),
  });
  
  // Test 11: Balanced div tags
  const openDivs = (content.match(/<div/g) || []).length;
  const closeDivs = (content.match(/<\/div>/g) || []).length;
  tests.push({
    name: 'Balanced div tags',
    pass: openDivs === closeDivs,
  });
  
  // Test 12: Balanced PageLayout tags
  const openPageLayout = (content.match(/<PageLayout/g) || []).length;
  const closePageLayout = (content.match(/<\/PageLayout>/g) || []).length;
  tests.push({
    name: 'Balanced PageLayout tags',
    pass: openPageLayout === closePageLayout,
  });
  
  // Test 13: Mobile pages should have title prop
  if (MOBILE_PAGES.includes(filename)) {
    const pageLayoutMatch = content.match(/<PageLayout[\s\S]*?>/);
    tests.push({
      name: 'Mobile page has title prop',
      pass: pageLayoutMatch && pageLayoutMatch[0].includes('title='),
    });
  }
  
  // Test 14: Title length (SEO best practice)
  const titleMatch = content.match(/title="([^"]+)"/);
  if (titleMatch) {
    tests.push({
      name: 'Title under 60 chars',
      pass: titleMatch[1].length <= 60,
    });
  }
  
  // Test 15: Description length (SEO best practice)
  const descMatch = content.match(/description="([^"]+)"/);
  if (descMatch) {
    tests.push({
      name: 'Description under 160 chars',
      pass: descMatch[1].length <= 160,
    });
  }
  
  return tests;
}

function runTests() {
  log(colors.cyan, '\n=====================================');
  log(colors.cyan, '  Page Standardization Verification');
  log(colors.cyan, '=====================================\n');
  
  const pageFiles = getAllPageFiles();
  stats.total = pageFiles.length;
  
  pageFiles.forEach((filename) => {
    const content = readPageFile(filename);
    const tests = testPageLayout(filename, content);
    
    const passed = tests.filter(t => t.pass).length;
    const failed = tests.filter(t => !t.pass).length;
    
    if (failed === 0) {
      stats.passed++;
      log(colors.green, `✓ ${filename} (${passed}/${tests.length} tests passed)`);
    } else {
      stats.failed++;
      log(colors.red, `✗ ${filename} (${passed}/${tests.length} tests passed)`);
      
      tests.forEach(test => {
        if (!test.pass) {
          log(colors.yellow, `  ⚠ Failed: ${test.name}`);
          stats.errors.push({ file: filename, test: test.name });
        }
      });
    }
  });
  
  // Print summary
  log(colors.cyan, '\n=====================================');
  log(colors.cyan, '  Summary');
  log(colors.cyan, '=====================================\n');
  
  log(colors.blue, `Total pages tested: ${stats.total}`);
  log(colors.green, `✓ Passed: ${stats.passed}`);
  
  if (stats.failed > 0) {
    log(colors.red, `✗ Failed: ${stats.failed}`);
    log(colors.yellow, `\nTotal errors: ${stats.errors.length}`);
    
    // Group errors by type
    const errorsByType = {};
    stats.errors.forEach(error => {
      if (!errorsByType[error.test]) {
        errorsByType[error.test] = [];
      }
      errorsByType[error.test].push(error.file);
    });
    
    log(colors.yellow, '\nErrors by type:');
    Object.entries(errorsByType).forEach(([test, files]) => {
      log(colors.yellow, `\n  ${test}:`);
      files.forEach(file => {
        log(colors.red, `    - ${file}`);
      });
    });
  }
  
  log(colors.cyan, '\n=====================================\n');
  
  // Exit with error code if tests failed
  if (stats.failed > 0) {
    process.exit(1);
  } else {
    log(colors.green, '✓ All pages follow standardization!\n');
    process.exit(0);
  }
}

// Run tests
runTests();
