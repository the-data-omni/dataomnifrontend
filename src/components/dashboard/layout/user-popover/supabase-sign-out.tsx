"use client";

import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/default-logger";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "@/components/core/toaster";

export function SupabaseSignOut(): React.JSX.Element {
	const [supabaseClient] = React.useState<SupabaseClient>(createSupabaseClient());

	const handleSignOut = React.useCallback(async (): Promise<void> => {
		try {
			const { error } = await supabaseClient.auth.signOut();

			if (error) {
				logger.error("Sign out error", error);
				toast.error("Something went wrong, unable to sign out");
				return;
			}

			// Supabase client will automatically update the user in AuthContext
			//  and then the AuthGuard will redirect to the sign-in page
		} catch (error) {
			logger.error("Sign out error", error);
			toast.error("Something went wrong, unable to sign out");
		}
	}, [supabaseClient]);

	return (
		<MenuItem component="div" onClick={handleSignOut} sx={{ justifyContent: "center" }}>
			Sign out
		</MenuItem>
	);
}
