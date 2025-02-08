import * as React from "react";
import { Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Layout as ChatLayout } from "@/components/dashboard/chat/layout";
import { Layout as DashboardLayout } from "@/components/dashboard/layout/layout";



export const route: RouteObject = {
	path: "dashboard",
	element: (
		<AuthGuard>
			<DashboardLayout>
				<Outlet />
			</DashboardLayout>
		</AuthGuard>
	),
	children: [
		{
			path: "analytics",
			lazy: async () => {
				const { Page } = await import("@/pages/dashboard/analytics");
				return { Component: Page };
			},
		},
		{
			path: "blank",
			lazy: async () => {
				const { Page } = await import("@/pages/dashboard/blank");
				return { Component: Page };
			},
		},
	
		{
			path: "chat",
			element: (
				<ChatLayout>
					<Outlet />
				</ChatLayout>
			),
			children: [
				{
					index: true,
					lazy: async () => {
						const { Page } = await import("@/pages/dashboard/chat/blank");
						return { Component: Page };
					},
				},
				{
					path: "compose",
					lazy: async () => {
						const { Page } = await import("@/pages/dashboard/chat/compose");
						return { Component: Page };
					},
				},
				{
					path: ":threadType/:threadId",
					lazy: async () => {
						const { Page } = await import("@/pages/dashboard/chat/thread");
						return { Component: Page };
					},
				},
			],
		},

		{
			path: "file-storage",
			lazy: async () => {
				const { Page } = await import("@/pages/dashboard/file-storage");
				return { Component: Page };
			},
		},





	
		{
			path: "products",
			children: [
				{
					index: true,
					lazy: async () => {
						const { Page } = await import("@/pages/dashboard/products/list");
						return { Component: Page };
					},
				},
				{
					path: "create",
					lazy: async () => {
						const { Page } = await import("@/pages/dashboard/products/create");
						return { Component: Page };
					},
				},
				{
					path: ":productId",
					lazy: async () => {
						const { Page } = await import("@/pages/dashboard/products/details");
						return { Component: Page };
					},
				},
			],
		},
		{
			path: "tasks",
			lazy: async () => {
				const { Page } = await import("@/pages/dashboard/tasks");
				return { Component: Page };
			},
		},
	],
};
