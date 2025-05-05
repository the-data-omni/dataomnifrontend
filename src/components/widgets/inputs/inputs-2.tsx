"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import http from "isomorphic-git/http/web";
import * as git from "isomorphic-git";
import LightningFS from "@isomorphic-git/lightning-fs";

interface GitHubRepoConfig {
  ownerOrOrg: string;
  repoName: string;
  branchName: string;
}

export function Inputs2(): React.JSX.Element {
  // ---------------------------------------------------
  // 1) Repo Config State
  // ---------------------------------------------------
  const [repoConfig, setRepoConfig] = React.useState<GitHubRepoConfig>({
    ownerOrOrg: "",
    repoName: "",
    branchName: "main", // default to "main"
  });

  function handleInputChange(field: keyof GitHubRepoConfig) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setRepoConfig((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  // ---------------------------------------------------
  // 2) In-Browser File System & Repo
  // ---------------------------------------------------
  const [fsBase] = React.useState(() => new LightningFS("myfs"));
  const pfs = fsBase.promises;
  const [dir] = React.useState("/repo"); // folder for the repo in the browser FS
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        await pfs.stat(`${dir}/.git`);
        console.log("Repo found; already initialized.");
        setInitialized(true);
      } catch (err) {
        console.log("No .git folder found; clone when ready.");
      }
    })();
  }, [pfs, dir]);

  // ---------------------------------------------------
  // 2a) Clone an existing GitHub repo
  // ---------------------------------------------------
  async function handleCloneRepo() {
    if (initialized) {
      alert("Repo already initialized.");
      return;
    }

    const token = prompt("Enter your GitHub personal access token:");
    if (!token) {
      alert("No token provided; cannot clone.");
      return;
    }

    const remoteUrl = `https://${token}:x-oauth-basic@github.com/${repoConfig.ownerOrOrg}/${repoConfig.repoName}.git`;

    try {
      // Make sure /repo folder exists
      await pfs.mkdir(dir).catch(() => {});
      // Clone the specified branch
      await git.clone({
        fs: fsBase,
        http,
        dir,
        url: remoteUrl,
        ref: repoConfig.branchName,
        singleBranch: true,
        depth: 1,
        onAuth: () => ({ username: "anyuser", password: token }),
      });
      setInitialized(true);
      alert("Cloned repo successfully into the browser FS!");
    } catch (cloneErr) {
      console.error("Clone error:", cloneErr);
      alert(String(cloneErr));
    }
  }

  // ---------------------------------------------------
  // 3) Committing changes locally
  // ---------------------------------------------------
  const [fileContent, setFileContent] = React.useState("// My schema\n");

  async function handleLocalCommit() {
    if (!initialized) {
      alert("Repo not initialized yet!");
      return;
    }
    try {
      const filename = "schema.json";
      // Write the file into the in-browser FS
      await pfs.writeFile(`${dir}/${filename}`, fileContent, "utf8");

      // Stage & commit
      await git.add({ fs: fsBase, dir, filepath: filename });
      const sha = await git.commit({
        fs: fsBase,
        dir,
        message: "Local commit",
        author: { name: "In-Browser User", email: "inbrowser@example.com" },
      });
      alert(`Committed! SHA: ${sha}`);
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  }

  // ---------------------------------------------------
  // 4) Pushing to GitHub (create branch if missing)
  // ---------------------------------------------------
  async function handlePushToGithub() {
    if (!initialized) {
      alert("Repo not initialized yet!");
      return;
    }

    const token = prompt("Enter your GitHub personal access token for push:");
    if (!token) {
      alert("No token, cannot push.");
      return;
    }

    const remoteUrl = `https://${token}:x-oauth-basic@github.com/${repoConfig.ownerOrOrg}/${repoConfig.repoName}.git`;

    try {
      // Add remote if needed
      await git
        .addRemote({ fs: fsBase, dir, remote: "origin", url: remoteUrl })
        .catch(() => {
          console.log("Remote 'origin' may already exist.");
        });

      // If the specified branch doesn't exist locally, create it
      try {
        await git.resolveRef({ fs: fsBase, dir, ref: repoConfig.branchName });
        console.log(`Local branch "${repoConfig.branchName}" exists.`);
      } catch (error) {
        if (error instanceof git.Errors.NotFoundError) {
          console.log(`Branch "${repoConfig.branchName}" not found locally. Creating it...`);
          await git.branch({ fs: fsBase, dir, ref: repoConfig.branchName });
          await git.checkout({ fs: fsBase, dir, ref: repoConfig.branchName });
        } else {
          throw error;
        }
      }

      // Now push that branch
      await git.push({
        fs: fsBase,
        http,
        dir,
        remote: "origin",
        ref: repoConfig.branchName,
        onAuth: () => ({ username: "anyuser", password: token }),
      });
      alert("Pushed to GitHub successfully!");
    } catch (err) {
      console.error("Push error:", err);
      alert(String(err));
    }
  }

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Stack spacing={2}>
        <Typography variant="h5">Connect to an Existing GitHub Repository</Typography>
        <Typography variant="body2" color="text.secondary">
          This component will clone an existing GitHub repo into the browser’s filesystem. 
          Then you can commit changes locally, and if your specified branch 
          doesn’t exist, it will be created before pushing.
        </Typography>

        <Divider />

        <TextField
          label="GitHub Owner or Org"
          value={repoConfig.ownerOrOrg}
          onChange={handleInputChange("ownerOrOrg")}
          helperText='e.g. "myusername" or "myorganization"'
          fullWidth
        />
        <TextField
          label="Repository Name"
          value={repoConfig.repoName}
          onChange={handleInputChange("repoName")}
          helperText='e.g. "my-schema-repo"'
          fullWidth
        />
        <TextField
          label="Branch Name"
          value={repoConfig.branchName}
          onChange={handleInputChange("branchName")}
          helperText='e.g. "main" or "master" or "feature/xyz"'
          fullWidth
        />

        {!initialized && (
          <Button variant="contained" onClick={handleCloneRepo}>
            Clone Repo
          </Button>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">Local File Edits</Typography>
        <Typography variant="body2" color="text.secondary">
          Edit your <code>schema.json</code> content here, then commit and push.
        </Typography>

        <TextField
          label="Local file content"
          multiline
          rows={8}
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          fullWidth
          sx={{ fontFamily: "monospace" }}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleLocalCommit}>
            Commit Locally
          </Button>
          <Button variant="contained" onClick={handlePushToGithub}>
            Push to GitHub
          </Button>
        </Stack>

        <Divider />

        <Typography variant="body2" color="text.secondary">
          Repo initialized? <strong>{initialized ? "Yes" : "No"}</strong>
        </Typography>
      </Stack>
    </Box>
  );
}
