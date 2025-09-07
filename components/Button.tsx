import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
	title: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "outline";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
}
export default function Button({
	title,
	onPress,
	variant = "primary",
	size = "md",
	loading = false,
	disabled = false,
	fullWidth = false,
}: ButtonProps) {
	const getVariantClasses = () => {
		switch (variant) {
			case "primary":
				return "bg-blue-500 active:bg-blue-600";
			case "secondary":
				return "bg-gray-500 active:bg-gray-600";
			case "outline":
				return "bg-transparent border-2 border-blue-500 active:bg-blue-50";
			default:
				return "bg-blue-500 active:bg-blue-600";
		}
	};
	const getSizeClasses = () => {
		switch (size) {
			case "sm":
				return "px-3 py-2";
			case "md":
				return "px-4 py-3";
			case "lg":
				return "px-6 py-4";
			default:
				return "px-4 py-3";
		}
	};
	const getTextClasses = () => {
		const sizeClass =
			size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";
		const colorClass = variant === "outline" ? "text-blue-500" : "text-white";
		return `${sizeClass} ${colorClass} font-semibold text-center`;
	};
	const buttonClasses = [
		"rounded-lg items-center justify-center",
		getVariantClasses(),
		getSizeClasses(),
		fullWidth && "w-full",
		(disabled || loading) && "opacity-50",
	]
		.filter(Boolean)
		.join(" ");
	return (
		<TouchableOpacity
			className={buttonClasses}
			onPress={onPress}
			disabled={disabled || loading}
		>
			{loading ? (
				<ActivityIndicator
					color={variant === "outline" ? "#3b82f6" : "white"}
				/>
			) : (
				<Text className={getTextClasses()}>{title}</Text>
			)}
		</TouchableOpacity>
	);
}
