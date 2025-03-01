"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import http from "isomorphic-git/http/web";
import * as git from "isomorphic-git";
import LightningFS from "@isomorphic-git/lightning-fs";

// ----------------------------------
// Types
// ----------------------------------
interface GitHubRepoConfig {
  repoOption: "existing" | "create";
  ownerOrOrg: string;
  repoName: string;
  branchName: string;
  mainBranch: boolean;
}

export function Inputs2(): React.JSX.Element {
  // ----------------------------------
  // 1) Form State
  // ----------------------------------
  const [repoConfig, setRepoConfig] = React.useState<GitHubRepoConfig>({
    repoOption: "existing",
    ownerOrOrg: "",
    repoName: "",
    branchName: "main",
    mainBranch: true,
  });

  function handleRepoOptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRepoConfig((prev) => ({
      ...prev,
      repoOption: e.target.value as "existing" | "create",
    }));
  }
  function handleInputChange(field: keyof GitHubRepoConfig) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setRepoConfig((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }
  function handleCheckboxChange(field: keyof GitHubRepoConfig) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setRepoConfig((prev) => ({ ...prev, [field]: e.target.checked }));
    };
  }

  // ----------------------------------
  // 2) In-Browser File System & Repo
  // ----------------------------------
  const [fsBase] = React.useState(() => new LightningFS("myfs", ));
  // pfs is the async/await interface
  const pfs = fsBase.promises;

  const [dir] = React.useState("/repo"); // local folder for the repo
  const [initialized, setInitialized] = React.useState(false);

  // On mount or when the user changes "create" vs. "existing,"
  // check if there's already a .git folder.
  React.useEffect(() => {
    (async () => {
      try {
        await pfs.stat(dir + "/.git");
        // If stat succeeds, the repo is already initialized
        console.log("Repo found; already initialized.");
        setInitialized(true);
      } catch (err) {
        console.log("No .git folder found.");
        if (repoConfig.repoOption === "create") {
          // If user wants a new repo, create /repo & init
          try {
            await pfs.mkdir(dir);
          } catch {
            // folder might exist already
          }
          await git.init({ fs: fsBase, dir });
          setInitialized(true);
          console.log("Initialized new ephemeral repo in the browser FS.");
        } else {
          // "existing" => We'll wait for user to clone manually (see handleCloneRepo below)
          console.log("Will clone if user triggers it.");
        }
      }
    })();
  }, [pfs, fsBase, dir, repoConfig.repoOption]);

  // 2a) Function to clone if user selects "existing"
  async function handleCloneRepo() {
    if (initialized) {
      return alert("Repo is already initialized.");
    }

    // Prompt for a GitHub token
    const token = prompt("Enter your GitHub personal access token:");
    if (!token) {
      return alert("No token provided; cannot clone.");
    }

    const remoteUrl = `https://${token}:x-oauth-basic@github.com/${repoConfig.ownerOrOrg}/${repoConfig.repoName}.git`;

    try {
      // Ensure /repo exists
      await pfs.mkdir(dir).catch(() => {});
      await git.clone({
        fs: fsBase,
        http,
        dir,
        url: remoteUrl,
        ref: repoConfig.branchName,
        singleBranch: true,
        depth: 1,
        onAuth: () => ({ username: "token", password: token }),
      });
      setInitialized(true);
      alert("Cloned repo successfully into the browser FS!");
    } catch (cloneErr) {
      console.error("Clone error:", cloneErr);
      alert(String(cloneErr));
    }
  }

  // ----------------------------------
  // 3) Committing Local Changes
  // ----------------------------------
  const [fileContent, setFileContent] = React.useState("// My ephemeral schema\n");

  async function handleLocalCommit() {
    if (!initialized) {
      return alert("Repo not initialized yet!");
    }
    try {
      const filename = "schema.json";

      // Write the file using pfs
      await pfs.writeFile(`${dir}/${filename}`, fileContent, "utf8");

      // Stage & Commit (pass fsBase to isomorphic-git)
      await git.add({ fs: fsBase, dir, filepath: filename });
      const sha = await git.commit({
        fs: fsBase,
        dir,
        message: "Local ephemeral commit",
        author: { name: "In-Browser User", email: "inbrowser@example.com" },
      });
      alert(`Committed! SHA: ${sha}`);
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  }

  // ----------------------------------
  // 4) Pushing to GitHub
  // ----------------------------------
  async function handlePushToGithub() {
    if (!initialized) {
      return alert("Repo not initialized yet!");
    }
    const token = prompt("Enter your GitHub personal access token for push:");
    if (!token) {
      return alert("No token, cannot push.");
    }

    const remoteUrl = `https://${token}:x-oauth-basic@github.com/${repoConfig.ownerOrOrg}/${repoConfig.repoName}.git`;

    try {
      // Add remote if needed
      await git.addRemote({
        fs: fsBase,
        dir,
        remote: "origin",
        url: remoteUrl,
      }).catch(() => {
        console.log("Remote 'origin' may already exist.");
      });

      // Push
      await git.push({
        fs: fsBase,
        http,
        dir,
        remote: "origin",
        ref: repoConfig.branchName,
        onAuth: () => ({ username: "token", password: token }),
      });
      alert("Pushed to GitHub successfully!");
    } catch (err) {
      console.error("Push error:", err);
      alert(String(err));
    }
  }

  // ----------------------------------
  // 5) Misc UI Handlers
  // ----------------------------------
  function handleConnect() {
    console.log("Repo config:", repoConfig);
    alert(
      repoConfig.repoOption === "create"
        ? "Creating new ephemeral repo automatically (if not found)."
        : "We'll clone from GitHub if you click 'Clone Repo' below."
    );
  }

  // ----------------------------------
  // Render
  // ----------------------------------
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Stack spacing={2}>
        <Typography variant="h5">Connect to a GitHub Repository</Typography>
        <Typography variant="body2" color="text.secondary">
          Choose whether you want to create a brand-new local repo or clone an existing one from GitHub.
        </Typography>

        <Divider />

        <RadioGroup value={repoConfig.repoOption} onChange={handleRepoOptionChange}>
          <FormControlLabel
            value="existing"
            control={<Radio />}
            label="Connect to Existing Repo"
          />
          <FormControlLabel
            value="create"
            control={<Radio />}
            label="Create a New Repo (ephemeral)"
          />
        </RadioGroup>

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
          helperText='e.g. "main" or "master"'
          fullWidth
        />

        <FormControlLabel
          control={
            <Radio
              checked={repoConfig.mainBranch}
              onChange={handleCheckboxChange("mainBranch")}
            />
          }
          label="Set this as the main branch?"
        />

        <Button variant="outlined" onClick={handleConnect}>
          Configure
        </Button>

        {repoConfig.repoOption === "existing" && !initialized && (
          <Button variant="contained" onClick={handleCloneRepo}>
            Clone Repo
          </Button>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">Ephemeral In-Browser Repo</Typography>
        <Typography variant="body2" color="text.secondary">
          Edit your <code>schema.json</code> content here. Then commit locally or push to GitHub.
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
