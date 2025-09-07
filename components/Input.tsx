import React from "react";
import { Text, TextInput, View } from "react-native";

interface InputProps {
	label?: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	multiline?: boolean;
	numberOfLines?: number;
	error?: string;
	disabled?: boolean;
}
export default function Input({
	label,
	value,
	onChangeText,
	placeholder,
	multiline = false,
	numberOfLines = 1,
	error,
	disabled = false,
}: InputProps) {
	const inputClasses = [
		"border border-gray-300 rounded-lg px-3 py-3 bg-white text-gray-900",
		"focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
		error && "border-red-500",
		disabled && "bg-gray-100 text-gray-500",
		multiline && "text-top",
	]
		.filter(Boolean)
		.join(" ");
	return (
		<View className="mb-4">
			{label && <Text className="text-gray-700 font-medium mb-2">{label}</Text>}

			<TextInput
				className={inputClasses}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				multiline={multiline}
				numberOfLines={numberOfLines}
				editable={!disabled}
				placeholderTextColor="#9ca3af"
			/>

			{error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
		</View>
	);
}
