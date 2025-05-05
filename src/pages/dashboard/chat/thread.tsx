// import * as React from "react";
// import { Helmet } from "react-helmet-async";
// import { useParams } from "react-router-dom";

// import type { Metadata } from "@/types/metadata";
// import { appConfig } from "@/config/app";
// import { ThreadView } from "@/components/dashboard/chat/thread-view";
// import type { ThreadType } from "@/components/dashboard/chat/types";

// const metadata = { title: `Thread | Chat | Dashboard | ${appConfig.name}` } satisfies Metadata;

// export function Page(): React.JSX.Element {
// 	const { threadId, threadType } = useParams() as { threadId: string; threadType: ThreadType };

// 	return (
// 		<React.Fragment>
// 			<Helmet>
// 				<title>{metadata.title}</title>
// 			</Helmet>
// 			<ThreadView threadId={threadId} threadType={threadType} />
// 		</React.Fragment>
// 	);
// }
import * as React from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

import type { Metadata } from "@/types/metadata";
import { appConfig } from "@/config/app";
import { ThreadView } from "@/components/dashboard/chat/thread-view";
import { AIThreadView } from "@/components/dashboard/chat/AIThreadView"; // <--- NEW
import type { ThreadType } from "@/components/dashboard/chat/types";

const metadata = { title: `Thread | Chat | Dashboard | ${appConfig.name}` } satisfies Metadata;

export function Page(): React.JSX.Element {
	console.log("Rendering <Page>...");
  const { threadId, threadType } = useParams() as { threadId: string; threadType: ThreadType };

  // If your LLM thread has an ID like "TRD-LLM", or you have some other way of detecting
  // that this is the AI conversation:
  const isAiThread = threadId === "TRD-LLM";

  return (
    <React.Fragment>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      {isAiThread ? (
        <AIThreadView threadId={threadId} threadType={threadType} />
      ) : (
        <ThreadView threadId={threadId} threadType={threadType} />
      )}
    </React.Fragment>
  );
}
