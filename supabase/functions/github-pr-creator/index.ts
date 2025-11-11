import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubPRRequest {
  improvementId: string;
  repoUrl: string; // Format: owner/repo
  baseBranch: string;
  title: string;
  description: string;
  fileChanges: {
    path: string;
    content: string;
  }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const githubToken = Deno.env.get('GITHUB_TOKEN');

    if (!githubToken) {
      throw new Error('GITHUB_TOKEN not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const body: GitHubPRRequest = await req.json();
    const { improvementId, repoUrl, baseBranch, title, description, fileChanges } = body;

    console.log(`Creating PR for improvement ${improvementId} in ${repoUrl}`);

    // Parse repo URL
    const [owner, repo] = repoUrl.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid repository URL format. Expected: owner/repo');
    }

    const branchName = `oneiros-improvement-${improvementId.substring(0, 8)}`;
    
    // 1. Get the default branch's latest commit SHA
    const defaultBranchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Oneiros-Platform-Optimizer',
        },
      }
    );

    if (!defaultBranchRes.ok) {
      const error = await defaultBranchRes.text();
      console.error('Failed to get base branch:', error);
      throw new Error(`Failed to get base branch: ${defaultBranchRes.statusText}`);
    }

    const defaultBranchData = await defaultBranchRes.json();
    const baseSha = defaultBranchData.object.sha;

    // 2. Check if branch already exists
    const existingBranchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branchName}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Oneiros-Platform-Optimizer',
        },
      }
    );

    let branchSha = baseSha;

    if (existingBranchRes.ok) {
      // Branch exists, use it
      const existingBranch = await existingBranchRes.json();
      branchSha = existingBranch.object.sha;
      console.log(`Branch ${branchName} already exists, using existing branch`);
    } else {
      // 3. Create new branch
      const createBranchRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Oneiros-Platform-Optimizer',
          },
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: baseSha,
          }),
        }
      );

      if (!createBranchRes.ok) {
        const error = await createBranchRes.text();
        console.error('Failed to create branch:', error);
        throw new Error(`Failed to create branch: ${createBranchRes.statusText}`);
      }

      console.log(`Created branch ${branchName}`);
    }

    // 4. Create commits for each file change
    for (const fileChange of fileChanges) {
      // Get current file (if exists) to get its blob SHA
      const fileRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${fileChange.path}?ref=${branchName}`,
        {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Oneiros-Platform-Optimizer',
          },
        }
      );

      let fileSha: string | undefined;
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        fileSha = fileData.sha;
      }

      // Update or create file
      const updateFileRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${fileChange.path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Oneiros-Platform-Optimizer',
          },
          body: JSON.stringify({
            message: `Apply improvement: ${title}`,
            content: btoa(fileChange.content), // Base64 encode
            branch: branchName,
            ...(fileSha && { sha: fileSha }),
          }),
        }
      );

      if (!updateFileRes.ok) {
        const error = await updateFileRes.text();
        console.error(`Failed to update file ${fileChange.path}:`, error);
        throw new Error(`Failed to update file: ${updateFileRes.statusText}`);
      }

      console.log(`Updated file: ${fileChange.path}`);
    }

    // 5. Create pull request
    const prBody = `${description}

---
**Automated Improvement**
- Improvement ID: \`${improvementId}\`
- Category: Platform Optimization
- Generated by: Oneiros Platform Optimizer

This pull request was automatically generated to improve the platform's code quality, performance, or security.`;

    const createPRRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Oneiros-Platform-Optimizer',
        },
        body: JSON.stringify({
          title: `[Platform Optimizer] ${title}`,
          body: prBody,
          head: branchName,
          base: baseBranch,
        }),
      }
    );

    if (!createPRRes.ok) {
      const error = await createPRRes.text();
      console.error('Failed to create PR:', error);
      
      // Check if PR already exists
      if (error.includes('A pull request already exists')) {
        // Get existing PR
        const prsRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls?head=${owner}:${branchName}&state=open`,
          {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Oneiros-Platform-Optimizer',
            },
          }
        );
        
        if (prsRes.ok) {
          const prs = await prsRes.json();
          if (prs.length > 0) {
            const existingPR = prs[0];
            
            // Update improvement record
            await supabase
              .from('platform_improvements')
              .update({
                github_pr_url: existingPR.html_url,
                github_pr_status: 'open',
                github_branch_name: branchName,
              })
              .eq('id', improvementId);

            return new Response(
              JSON.stringify({
                success: true,
                pr_url: existingPR.html_url,
                pr_number: existingPR.number,
                branch_name: branchName,
                message: 'Using existing pull request',
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
      
      throw new Error(`Failed to create PR: ${createPRRes.statusText}`);
    }

    const prData = await createPRRes.json();
    console.log(`Created PR #${prData.number}: ${prData.html_url}`);

    // 6. Add labels to PR
    await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${prData.number}/labels`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Oneiros-Platform-Optimizer',
        },
        body: JSON.stringify({
          labels: ['automated', 'platform-optimizer', 'improvement'],
        }),
      }
    );

    // 7. Update improvement record in database
    const { error: updateError } = await supabase
      .from('platform_improvements')
      .update({
        github_pr_url: prData.html_url,
        github_pr_status: 'open',
        github_branch_name: branchName,
      })
      .eq('id', improvementId);

    if (updateError) {
      console.error('Failed to update improvement record:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        pr_url: prData.html_url,
        pr_number: prData.number,
        branch_name: branchName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error creating GitHub PR:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
