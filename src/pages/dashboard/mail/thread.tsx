import * as React from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

import type { Metadata } from "@/types/metadata";
import { appConfig } from "@/config/app";
import { ThreadView } from "@/components/dashboard/mail/thread-view";

const metadata = { title: `Thread | Mail | Dashboard | ${appConfig.name}` } satisfies Metadata;

export function Page(): React.JSX.Element {
	const { threadId } = useParams() as { threadId: string };

	return (
		<React.Fragment>
			<Helmet>
				<title>{metadata.title}</title>
			</Helmet>
			<ThreadView threadId={threadId} />
		</React.Fragment>
	);
}
