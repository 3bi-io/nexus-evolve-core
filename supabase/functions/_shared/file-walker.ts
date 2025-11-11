/**
 * File System Walker for Edge Functions
 * Recursively walks directory tree and collects files matching patterns
 */

export interface FileEntry {
  path: string;
  content: string;
  size: number;
}

/**
 * Recursively walk directory and collect files matching pattern
 * @param dir - Directory to walk
 * @param pattern - RegExp pattern to match files
 * @param maxDepth - Maximum recursion depth (default: 10)
 * @param currentDepth - Internal: current depth
 * @returns Array of file paths
 */
export async function walkDirectory(
  dir: string,
  pattern: RegExp,
  maxDepth: number = 10,
  currentDepth: number = 0
): Promise<string[]> {
  if (currentDepth >= maxDepth) {
    return [];
  }

  const files: string[] = [];

  try {
    for await (const entry of Deno.readDir(dir)) {
      // Skip hidden files and directories
      if (entry.name.startsWith('.')) continue;

      // Skip common directories that should not be analyzed
      if (entry.name === 'node_modules' || 
          entry.name === 'dist' || 
          entry.name === 'build' ||
          entry.name === '.git' ||
          entry.name === 'migrations') {
        continue;
      }

      const fullPath = `${dir}/${entry.name}`;

      if (entry.isDirectory) {
        // Recursively walk subdirectories
        const subFiles = await walkDirectory(fullPath, pattern, maxDepth, currentDepth + 1);
        files.push(...subFiles);
      } else if (entry.isFile && pattern.test(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error walking directory ${dir}:`, error);
  }

  return files;
}

/**
 * Read multiple files and return their contents
 * @param paths - Array of file paths to read
 * @param maxFileSize - Maximum file size in bytes (default: 100KB)
 * @returns Array of file entries
 */
export async function readFiles(
  paths: string[],
  maxFileSize: number = 100000
): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];

  for (const path of paths) {
    try {
      const stat = await Deno.stat(path);
      
      // Skip files that are too large
      if (stat.size > maxFileSize) {
        console.warn(`Skipping large file: ${path} (${stat.size} bytes)`);
        continue;
      }

      const content = await Deno.readTextFile(path);
      entries.push({
        path,
        content,
        size: stat.size,
      });
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
    }
  }

  return entries;
}

/**
 * Get project files for analysis
 * @returns Object with categorized file paths
 */
export async function getProjectFiles(): Promise<{
  frontend: string[];
  backend: string[];
  components: string[];
  hooks: string[];
  pages: string[];
}> {
  const [
    frontendFiles,
    backendFiles,
    componentFiles,
    hookFiles,
    pageFiles,
  ] = await Promise.all([
    walkDirectory('src', /\.(tsx?|jsx?)$/),
    walkDirectory('supabase/functions', /\.ts$/),
    walkDirectory('src/components', /\.(tsx?|jsx?)$/),
    walkDirectory('src/hooks', /\.ts$/),
    walkDirectory('src/pages', /\.(tsx?|jsx?)$/),
  ]);

  return {
    frontend: frontendFiles,
    backend: backendFiles,
    components: componentFiles,
    hooks: hookFiles,
    pages: pageFiles,
  };
}

/**
 * Sample files for analysis (to avoid processing too many files)
 * @param files - Array of file paths
 * @param maxFiles - Maximum number of files to sample
 * @returns Sampled file paths
 */
export function sampleFiles(files: string[], maxFiles: number): string[] {
  if (files.length <= maxFiles) {
    return files;
  }

  // Prioritize important files
  const priorityPatterns = [
    /index\.(tsx?|jsx?)/,
    /main\.(tsx?|jsx?)/,
    /App\.(tsx?|jsx?)/,
    /router/i,
    /auth/i,
  ];

  const priorityFiles = files.filter(f => 
    priorityPatterns.some(p => p.test(f))
  );

  const otherFiles = files.filter(f => 
    !priorityPatterns.some(p => p.test(f))
  );

  // Take all priority files and sample from others
  const remainingSlots = maxFiles - priorityFiles.length;
  const sampledOthers = otherFiles
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.max(0, remainingSlots));

  return [...priorityFiles, ...sampledOthers];
}
