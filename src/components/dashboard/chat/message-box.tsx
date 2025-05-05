

// // "use client";

// // import * as React from "react";
// // import Avatar from "@mui/material/Avatar";
// // import Box from "@mui/material/Box";
// // import Card from "@mui/material/Card";
// // import CardMedia from "@mui/material/CardMedia";
// // import Link from "@mui/material/Link";
// // import Stack from "@mui/material/Stack";
// // import Typography from "@mui/material/Typography";
// // import { Tabs, Tab, Button } from "@mui/material";
// // import { dayjs } from "@/lib/dayjs";
// // import type { Message } from "./types";

// // // Existing tab components
// // import { ChartTab } from "@/components/dashboard/ChartTab";
// // import { DataTab } from "@/components/dashboard/DataTab";
// // import { SQLTab } from "@/components/dashboard/SQLTab";
// // import { DataFlowTab } from "@/components/dashboard/DataFlowTab";
// // // New profile-specific components:
// // import { ProfileChartTab } from "@/components/dashboard/ProfileChartTab";
// // import { ProfileDataTab } from "@/components/dashboard/ProfileDataTab";

// // const user = {
// //   id: "USR-000",
// //   name: "Sofia Rivers",
// //   avatar: "/assets/avatar.png",
// // } as const;

// // export interface MessageBoxProps {
// //   message: Message;
// // }

// // /**
// //  * Special bubble for "llm" type messages.
// //  */
// // function LLMResponseBubble({ message }: { message: Message }) {
// //   const position = message.author.id === user.id ? "right" : "left";
// //   const [tabValue, setTabValue] = React.useState(0);

// //   // Extract fields from the LLM message
// //   const { content, sql = "", chartData = [] } = message;

// //   // Determine the default state for the tabs section:
// //   // - If message.profile exists (initial profile bubble), default to closed.
// //   // - Otherwise, if chartData is present and non-empty, default to open; else closed.
// //   const defaultTabsOpen = message.profile ? false : (chartData && chartData.length > 0 ? true : false);
// //   const [tabsOpen, setTabsOpen] = React.useState(defaultTabsOpen);

// //   return (
// //     <Box
// //       sx={{
// //         alignItems: position === "right" ? "flex-end" : "flex-start",
// //         display: "flex",
// //         flex: "0 0 auto",
// //       }}
// //     >
// //       <Stack
// //         direction={position === "right" ? "row-reverse" : "row"}
// //         spacing={2}
// //         sx={{
// //           alignItems: "flex-start",
// //           minWidth: "75%",
// //           ml: position === "right" ? "auto" : 0,
// //           mr: position === "left" ? "auto" : 0,
// //         }}
// //       >
// //         <Avatar src={message.author.avatar} />
// //         <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
// //           <Card
// //             sx={{
// //               px: 2,
// //               py: 1,
// //               ...(position === "right" && {
// //                 bgcolor: "var(--mui-palette-primary-main)",
// //                 color: "var(--mui-palette-primary-contrastText)",
// //               }),
// //             }}
// //           >
// //             <Stack spacing={1}>
// //               <div>
// //                 <Link color="inherit" variant="subtitle2" sx={{ cursor: "pointer" }}>
// //                   {message.author.name}
// //                 </Link>
// //               </div>
// //               {/* Display the message content */}
// //               <Typography variant="body1" color="inherit">
// //                 {content}
// //               </Typography>

// //               {/* Toggle button to show/hide the tabs section */}
// //               <Button
// //                 onClick={() => setTabsOpen((prev) => !prev)}
// //                 size="small"
// //                 sx={{ alignSelf: "flex-end", mb: 1 }}
// //               >
// //                 {tabsOpen ? "Hide Details" : "Show Details"}
// //               </Button>

// //               {/* Tabs section is rendered only when tabsOpen is true */}
// //               {tabsOpen && (
// //                 <>
// //                   <Tabs
// //                     value={tabValue}
// //                     onChange={(_, newVal) => setTabValue(newVal)}
// //                     variant="fullWidth"
// //                     sx={{ borderBottom: "1px solid var(--mui-palette-divider)" }}
// //                   >
// //                     <Tab label="Chart" />
// //                     <Tab label="Data" />
// //                     <Tab label="Code" />
// //                     <Tab label="Data Flow" />
// //                   </Tabs>
// //                   <Box sx={{ mt: 1 }}>
// //                     {tabValue === 0 &&
// //                       (message.profile && message.profileSynth ? (
// //                         <ProfileChartTab
// //                         profile={message.profile}
// //                         profileSynth={message.profileSynth}
// //                       />
// //                       ) : (
// //                         <ChartTab data={chartData} />
// //                       ))}
// //                     {tabValue === 1 &&
// //                       (message.profile ? (
// //                         <ProfileDataTab />
// //                       ) : (
// //                         <DataTab data={chartData} />
// //                       ))}
// //                     {tabValue === 2 && <SQLTab sql={sql || "SQL placeholder"} />}
// //                     {tabValue === 3 && <DataFlowTab />}
// //                   </Box>
// //                 </>
// //               )}
// //             </Stack>
// //           </Card>
// //           <Box
// //             sx={{
// //               display: "flex",
// //               justifyContent: position === "right" ? "flex-end" : "flex-start",
// //               px: 2,
// //             }}
// //           >
// //             <Typography color="text.secondary" noWrap variant="caption">
// //               {dayjs(message.createdAt).fromNow()}
// //             </Typography>
// //           </Box>
// //         </Stack>
// //       </Stack>
// //     </Box>
// //   );
// // }

// // /**
// //  * Default bubble for "text" or "image" type messages.
// //  */
// // function DefaultBubble({ message }: { message: Message }) {
// //   const position = message.author.id === user.id ? "right" : "left";

// //   return (
// //     <Box
// //       sx={{
// //         alignItems: position === "right" ? "flex-end" : "flex-start",
// //         display: "flex",
// //         flex: "0 0 auto",
// //       }}
// //     >
// //       <Stack
// //         direction={position === "right" ? "row-reverse" : "row"}
// //         spacing={2}
// //         sx={{
// //           alignItems: "flex-start",
// //           maxWidth: "75%",
// //           ml: position === "right" ? "auto" : 0,
// //           mr: position === "left" ? "auto" : 0,
// //         }}
// //       >
// //         <Avatar src={message.author.avatar} />
// //         <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
// //           <Card
// //             sx={{
// //               px: 2,
// //               py: 1,
// //               ...(position === "right" && {
// //                 bgcolor: "var(--mui-palette-primary-main)",
// //                 color: "var(--mui-palette-primary-contrastText)",
// //               }),
// //             }}
// //           >
// //             <Stack spacing={1}>
// //               <div>
// //                 <Link color="inherit" variant="subtitle2" sx={{ cursor: "pointer" }}>
// //                   {message.author.name}
// //                 </Link>
// //               </div>
// //               {message.type === "image" ? (
// //                 <CardMedia image={message.content} sx={{ height: "200px", width: "200px" }} />
// //               ) : null}
// //               {message.type === "text" ? (
// //                 <Typography variant="body1" color="inherit">
// //                   {message.content}
// //                 </Typography>
// //               ) : null}
// //             </Stack>
// //           </Card>
// //           <Box
// //             sx={{
// //               display: "flex",
// //               justifyContent: position === "right" ? "flex-end" : "flex-start",
// //               px: 2,
// //             }}
// //           >
// //             <Typography color="text.secondary" noWrap variant="caption">
// //               {dayjs(message.createdAt).fromNow()}
// //             </Typography>
// //           </Box>
// //         </Stack>
// //       </Stack>
// //     </Box>
// //   );
// // }

// // /**
// //  * Renders different bubble components depending on message.type.
// //  */
// // export function MessageBox({ message }: MessageBoxProps) {
// //   if (message.type === "llm") {
// //     return <LLMResponseBubble message={message} />;
// //   }
// //   return <DefaultBubble message={message} />;
// // }

// "use client";

// import * as React from "react";
// import Avatar from "@mui/material/Avatar";
// import Box from "@mui/material/Box";
// import Card from "@mui/material/Card";
// import CardMedia from "@mui/material/CardMedia";
// import Link from "@mui/material/Link";
// import Stack from "@mui/material/Stack";
// import Typography from "@mui/material/Typography";
// import { Tabs, Tab, Button } from "@mui/material";

// import { dayjs } from "@/lib/dayjs";
// import type { Message } from "./types";

// // Import your ChatContext for the updateMessage function
// import { ChatContext } from "./chat-context";

// // Existing tab components
// import { ChartTab } from "@/components/dashboard/ChartTab";
// import { DataTab } from "@/components/dashboard/DataTab";
// import { SQLTab } from "@/components/dashboard/SQLTab";
// import { DataFlowTab } from "@/components/dashboard/DataFlowTab";
// // New profile-specific components
// import { ProfileChartTab } from "@/components/dashboard/ProfileChartTab";
// import { ProfileDataTab } from "@/components/dashboard/ProfileDataTab";

// const user = {
//   id: "USR-000",
//   name: "Sofia Rivers",
//   avatar: "/assets/avatar.png",
// } as const;

// export interface MessageBoxProps {
//   message: Message;
// }

// /**
//  * Special bubble for "llm" type messages.
//  */
// function LLMResponseBubble({ message }: { message: Message }) {
//   const { updateMessage } = React.useContext(ChatContext);

//   const position = message.author.id === user.id ? "right" : "left";
//   const [tabValue, setTabValue] = React.useState(0);

//   // Extract fields from the LLM message
//   const { content, sql = "", chartData = [], profile, profileSynth } = message;

//   // The "profile" field indicates the initial profiling bubble, so skip toggling real data
//   const isProfileBubble = !!profile;

//   // Determine the default state for the tabs section
//   const defaultTabsOpen = isProfileBubble ? false : (chartData && chartData.length > 0);
//   const [tabsOpen, setTabsOpen] = React.useState(defaultTabsOpen);

//   /**
//    * Example function that calls /llm_free_analysis to get "real" data
//    */
//   async function handleToggleRealData() {
//     try {
//       const resp = await fetch("http://127.0.0.1:8000/llm_free_analysis", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           code: sql,
//           data: [ /* real_data here, or some ID referencing the real dataset */ ],
//           parameterized_summary: "some param summary placeholder",
//         }),
//       });
//       if (!resp.ok) throw new Error("Failed to fetch from /llm_free_analysis");

//       const parsed = await resp.json();
//       console.log("Toggled to real data. Response:", parsed);

//       // Suppose the new response has chart_data, parameterized_summary, etc.
//       updateMessage(message.id, {
//         chartData: parsed.chart_data ?? [],
//         content: `Real Data Summary:\n${parsed.parameterized_summary ?? "No summary"}`
//       });
//     } catch (err: any) {
//       console.error("Error toggling real data:", err);
//     }
//   }

//   return (
//     <Box
//       sx={{
//         alignItems: position === "right" ? "flex-end" : "flex-start",
//         display: "flex",
//         flex: "0 0 auto",
//       }}
//     >
//       <Stack
//         direction={position === "right" ? "row-reverse" : "row"}
//         spacing={2}
//         sx={{
//           alignItems: "flex-start",
//           minWidth: "75%",
//           ml: position === "right" ? "auto" : 0,
//           mr: position === "left" ? "auto" : 0,
//         }}
//       >
//         <Avatar src={message.author.avatar} />
//         <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
//           <Card
//             sx={{
//               px: 2,
//               py: 1,
//               ...(position === "right" && {
//                 bgcolor: "var(--mui-palette-primary-main)",
//                 color: "var(--mui-palette-primary-contrastText)",
//               }),
//             }}
//           >
//             <Stack spacing={1}>
//               <div>
//                 <Link color="inherit" variant="subtitle2" sx={{ cursor: "pointer" }}>
//                   {message.author.name}
//                 </Link>
//               </div>

//               {/* Display the message content */}
//               <Typography variant="body1" color="inherit">
//                 {content}
//               </Typography>

//               {/* If not the initial profile bubble, show a "Toggle Real Data" button */}
//               {!isProfileBubble && (
//                 <Button
//                   onClick={handleToggleRealData}
//                   size="small"
//                   sx={{ alignSelf: "flex-end", mb: 1 }}
//                 >
//                   Toggle Real Data
//                 </Button>
//               )}

//               {/* Toggle button for showing/hiding the chart/data tabs */}
//               <Button
//                 onClick={() => setTabsOpen((prev) => !prev)}
//                 size="small"
//                 sx={{ alignSelf: "flex-end", mb: 1 }}
//               >
//                 {tabsOpen ? "Hide Details" : "Show Details"}
//               </Button>

//               {/* Render tabs if open */}
//               {tabsOpen && (
//                 <>
//                   <Tabs
//                     value={tabValue}
//                     onChange={(_, newVal) => setTabValue(newVal)}
//                     variant="fullWidth"
//                     sx={{ borderBottom: "1px solid var(--mui-palette-divider)" }}
//                   >
//                     <Tab label="Chart" />
//                     <Tab label="Data" />
//                     <Tab label="Code" />
//                     <Tab label="Data Flow" />
//                   </Tabs>
//                   <Box sx={{ mt: 1 }}>
//                     {tabValue === 0 &&
//                       (profile && profileSynth ? (
//                         <ProfileChartTab profile={profile} profileSynth={profileSynth} />
//                       ) : (
//                         <ChartTab data={chartData} />
//                       ))}
//                     {tabValue === 1 &&
//                       (profile ? (
//                         <ProfileDataTab />
//                       ) : (
//                         <DataTab data={chartData} />
//                       ))}
//                     {tabValue === 2 && <SQLTab sql={sql || "SQL placeholder"} />}
//                     {tabValue === 3 && <DataFlowTab />}
//                   </Box>
//                 </>
//               )}
//             </Stack>
//           </Card>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: position === "right" ? "flex-end" : "flex-start",
//               px: 2,
//             }}
//           >
//             <Typography color="text.secondary" noWrap variant="caption">
//               {dayjs(message.createdAt).fromNow()}
//             </Typography>
//           </Box>
//         </Stack>
//       </Stack>
//     </Box>
//   );
// }

// /**
//  * Default bubble for "text" or "image" type messages.
//  */
// function DefaultBubble({ message }: { message: Message }) {
//   const position = message.author.id === user.id ? "right" : "left";

//   return (
//     <Box
//       sx={{
//         alignItems: position === "right" ? "flex-end" : "flex-start",
//         display: "flex",
//         flex: "0 0 auto",
//       }}
//     >
//       <Stack
//         direction={position === "right" ? "row-reverse" : "row"}
//         spacing={2}
//         sx={{
//           alignItems: "flex-start",
//           maxWidth: "75%",
//           ml: position === "right" ? "auto" : 0,
//           mr: position === "left" ? "auto" : 0,
//         }}
//       >
//         <Avatar src={message.author.avatar} />
//         <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
//           <Card
//             sx={{
//               px: 2,
//               py: 1,
//               ...(position === "right" && {
//                 bgcolor: "var(--mui-palette-primary-main)",
//                 color: "var(--mui-palette-primary-contrastText)",
//               }),
//             }}
//           >
//             <Stack spacing={1}>
//               <div>
//                 <Link color="inherit" variant="subtitle2" sx={{ cursor: "pointer" }}>
//                   {message.author.name}
//                 </Link>
//               </div>
//               {message.type === "image" ? (
//                 <CardMedia image={message.content} sx={{ height: "200px", width: "200px" }} />
//               ) : null}
//               {message.type === "text" ? (
//                 <Typography variant="body1" color="inherit">
//                   {message.content}
//                 </Typography>
//               ) : null}
//             </Stack>
//           </Card>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: position === "right" ? "flex-end" : "flex-start",
//               px: 2,
//             }}
//           >
//             <Typography color="text.secondary" noWrap variant="caption">
//               {dayjs(message.createdAt).fromNow()}
//             </Typography>
//           </Box>
//         </Stack>
//       </Stack>
//     </Box>
//   );
// }

// /**
//  * Renders different bubble components depending on message.type.
//  */
// export function MessageBox({ message }: MessageBoxProps) {
//   if (message.type === "llm") {
//     return <LLMResponseBubble message={message} />;
//   }
//   return <DefaultBubble message={message} />;
// }
"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Tabs, Tab, Button } from "@mui/material";

import { dayjs } from "@/lib/dayjs";
import type { Message } from "./types";
import { ChatContext } from "./chat-context";

// Existing tab components
import { ChartTab } from "@/components/dashboard/ChartTab";
import { DataTab } from "@/components/dashboard/DataTab";
import { SQLTab } from "@/components/dashboard/SQLTab";
import { DataFlowTab } from "@/components/dashboard/DataFlowTab";
// Example profile-specific components
import { ProfileChartTab } from "@/components/dashboard/ProfileChartTab";
import { ProfileDataTab } from "@/components/dashboard/ProfileDataTab";
import { FINANCIAL_DATA } from "./data/financial_data";

const user = {
  id: "USR-000",
  name: "Sofia Rivers",
  avatar: "/assets/avatar.png",
} as const;

export interface MessageBoxProps {
  message: Message;
}

/**
 * Bubble specifically for LLM messages
 */
function LLMResponseBubble({ message }: { message: Message }) {
  const { updateMessage } = React.useContext(ChatContext);

  const position = message.author.id === user.id ? "right" : "left";
  const [tabValue, setTabValue] = React.useState(0);

  // De-structure relevant fields from the message
  const {
    content,
    sql = "",
    chartData = [],
    profile,
    profileSynth,
    generated_code,
    parameterizedSummary,
  } = message;

  // We treat a bubble with profile set as the "initial" bubble
  const isProfileBubble = !!profile;
  const defaultTabsOpen = isProfileBubble ? false : chartData.length > 0;
  const [tabsOpen, setTabsOpen] = React.useState(defaultTabsOpen);

  /**
   * Example function that calls /llm_free_analysis to get new chart data for the "real" dataset
   */
  async function handleToggleRealData() {
    try {
      // your real dataset
      const realData = [
        /* { competitorname: "Mars", winpercent: 78.6 }, ... */
      ];

      const bodyPayload = {
        code: sql, // The code snippet from the LLM
        parameterized_summary: parameterizedSummary, // e.g. placeholders
        data: FINANCIAL_DATA,
      };

      const resp = await fetch("http://127.0.0.1:8000/llm_free_analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      if (!resp.ok) throw new Error("Failed to fetch from /llm_free_analysis");
      const parsed = await resp.json();

      console.log("Toggled real data. Response:", parsed);

      // Suppose it returns chart_data + updated text, etc.
      updateMessage(message.id, {
        chartData: parsed.chart_data ?? [],
        content: `Real Data Summary:\n${parsed.parameterized_summary ?? "N/A"}`
      });
    } catch (err) {
      console.error("Error toggling real data:", err);
    }
  }

  return (
    <Box
      sx={{
        alignItems: position === "right" ? "flex-end" : "flex-start",
        display: "flex",
        flex: "0 0 auto",
      }}
    >
      <Stack
        direction={position === "right" ? "row-reverse" : "row"}
        spacing={2}
        sx={{
          alignItems: "flex-start",
          minWidth: "75%",
          ml: position === "right" ? "auto" : 0,
          mr: position === "left" ? "auto" : 0,
        }}
      >
        <Avatar src={message.author.avatar} />
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
          <Card
            sx={{
              px: 2,
              py: 1,
              ...(position === "right" && {
                bgcolor: "var(--mui-palette-primary-main)",
                color: "var(--mui-palette-primary-contrastText)",
              }),
            }}
          >
            <Stack spacing={1}>
              {/* Author name */}
              <div>
                <Link color="inherit" variant="subtitle2" sx={{ cursor: "pointer" }}>
                  {message.author.name}
                </Link>
              </div>

              {/* The main text content */}
              <Typography variant="body1" color="inherit">
                {content}
              </Typography>

              {/* Toggle button for real data (skip if it's the profile bubble) */}
              {!isProfileBubble && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ alignSelf: "flex-end", mb: 1 }}
                  onClick={handleToggleRealData}
                >
                  Toggle Real Data
                </Button>
              )}

              {/* Expand/collapse the tab section */}
              <Button
                variant="outlined"
                size="small"
                onClick={() => setTabsOpen((prev) => !prev)}
                sx={{ alignSelf: "flex-end", mb: 1 }}
              >
                {tabsOpen ? "Hide Details" : "Show Details"}
              </Button>

              {tabsOpen && (
                <>
                  <Tabs
                    value={tabValue}
                    onChange={(_, newVal) => setTabValue(newVal)}
                    variant="fullWidth"
                    sx={{ borderBottom: "1px solid var(--mui-palette-divider)" }}
                  >
                    <Tab label="Chart" />
                    <Tab label="Data" />
                    <Tab label="Code" />
                    <Tab label="Data Flow" />
                  </Tabs>
                  <Box sx={{ mt: 1 }}>
                    {tabValue === 0 &&
                      (profile && profileSynth ? (
                        <ProfileChartTab profile={profile} profileSynth={profileSynth} />
                      ) : (
                        <ChartTab data={chartData} />
                      ))}
                    {tabValue === 1 &&
                      (profile ? (
                        <ProfileDataTab />
                      ) : (
                        <DataTab data={chartData} />
                      ))}
                    {tabValue === 2 && <SQLTab sql={sql || "SQL placeholder"} />}
                    {tabValue === 3 && <DataFlowTab />}
                  </Box>
                </>
              )}
            </Stack>
          </Card>

          {/* Timestamp */}
          <Box
            sx={{
              display: "flex",
              justifyContent: position === "right" ? "flex-end" : "flex-start",
              px: 2,
            }}
          >
            <Typography color="text.secondary" noWrap variant="caption">
              {dayjs(message.createdAt).fromNow()}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

/**
 * Default bubble for "text" or "image" type messages.
 */
function DefaultBubble({ message }: { message: Message }) {
  const position = message.author.id === user.id ? "right" : "left";

  return (
    <Box
      sx={{
        alignItems: position === "right" ? "flex-end" : "flex-start",
        display: "flex",
        flex: "0 0 auto",
      }}
    >
      <Stack
        direction={position === "right" ? "row-reverse" : "row"}
        spacing={2}
        sx={{
          alignItems: "flex-start",
          maxWidth: "75%",
          ml: position === "right" ? "auto" : 0,
          mr: position === "left" ? "auto" : 0,
        }}
      >
        <Avatar src={message.author.avatar} />
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
          <Card
            sx={{
              px: 2,
              py: 1,
              ...(position === "right" && {
                bgcolor: "var(--mui-palette-primary-main)",
                color: "var(--mui-palette-primary-contrastText)",
              }),
            }}
          >
            <Stack spacing={1}>
              <div>
                <Link color="inherit" variant="subtitle2" sx={{ cursor: "pointer" }}>
                  {message.author.name}
                </Link>
              </div>
              {message.type === "image" ? (
                <CardMedia image={message.content} sx={{ height: "200px", width: "200px" }} />
              ) : null}
              {message.type === "text" ? (
                <Typography variant="body1" color="inherit">
                  {message.content}
                </Typography>
              ) : null}
            </Stack>
          </Card>
          <Box
            sx={{
              display: "flex",
              justifyContent: position === "right" ? "flex-end" : "flex-start",
              px: 2,
            }}
          >
            <Typography color="text.secondary" noWrap variant="caption">
              {dayjs(message.createdAt).fromNow()}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

/**
 * Master switch based on message.type.
 */
export function MessageBox({ message }: MessageBoxProps) {
  if (message.type === "llm") {
    return <LLMResponseBubble message={message} />;
  }
  return <DefaultBubble message={message} />;
}
