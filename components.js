"use strict";
const React = require("react");
const { Box, Text } = require("ink");

const ScoreBoard = () => {
	return (
		<Box flexDirection="column">
			<Text>Correctly Answered : 0</Text>
			<Text>Incorrectly Answered : 0</Text>
			<Text>Total Question : 155</Text>
		</Box>
	);
};

module.exports = {
	ScoreBoard
};
