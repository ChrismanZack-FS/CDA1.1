import React from "react";
import { View } from "react-native";

interface CardProps {
	children: React.ReactNode;
	variant?: "default" | "elevated" | "outlined";
	padding?: "sm" | "md" | "lg";
}
export default function Card({
	children,
	variant = "default",
	padding = "md",
}: CardProps) {
	const getVariantClasses = () => {
		switch (variant) {
			case "elevated":
				return "bg-white shadow-md";
			case "outlined":
				return "bg-white border border-gray-200";
			default:
				return "bg-white";
		}
	};
	const getPaddingClasses = () => {
		switch (padding) {
			case "sm":
				return "p-3";
			case "md":
				return "p-4";
			case "lg":
				return "p-6";
			default:
				return "p-4";
		}
	};
	const cardClasses = [
		"rounded-lg",
		getVariantClasses(),
		getPaddingClasses(),
	].join(" ");
	return <View className={cardClasses}>{children}</View>;
}
