"use strict";
const React = require("react");
const { Box, Text, Newline } = require("ink");
const SelectInput = require("ink-select-input").default;
const Markdown = require("ink-markdown").default;
const ProgressBar = require("ink-progress-bar").default;
const BigText = require("ink-big-text");
const TextInput = require("ink-text-input").default;

const useDeepCompareEffect = require("use-deep-compare-effect").default;

const { getQuestions, loadUserInfo, writeUserInfo } = require("./utils");

const { useState } = React;

const WelcomeScreen = ({ userInfo, setUserInfo, setPageToShow }) => {
	const [value, setValue] = useState("");
	return (
		<Box
			flexDirection="column"
			borderColor="#F0DB4F"
			borderStyle="single"
			alignItems="center"
		>
			<BigText
				colors={["#F0DB4F", "#323330"]}
				font="grid"
				text="JS Questions"
			/>
			{userInfo.username ? (
				<Text>
					Welcome {userInfo.username} <Newline />
				</Text>
			) : (
				<Text color="#F0DB4F">
					<Newline />
					Enter Your Name to get Started :
					<TextInput
						color="#F0DB4F"
						value={value}
						onChange={setValue}
						onSubmit={() => {
							writeUserInfo({ ...userInfo, username: value })
								.then(data => {
									setUserInfo(data);
								})
								.catch(err => console.log(err));
						}}
					/>
				</Text>
			)}
			{userInfo.username ? (
				<Box flexDirection="column">
					<Text>
						Go to:
						<Newline />
					</Text>
					<SelectInput
						items={[
							{ label: "Questions", value: "qn" },
							{ label: "Stats", value: "sb" },
							{ label: "quit", value: 1 }
						]}
						onSelect={item => {
							if (item.value === 1) process.exit(1);
							setPageToShow(item.value);
						}}
					/>
				</Box>
			) : (
				<Text></Text>
			)}
		</Box>
	);
};
const ScoreBoard = ({ setPageToShow, userInfo, totalQn }) => {
	return (
		<Box
			flexDirection="column"
			borderColor="#F0DB4F"
			borderStyle="classic"
			padding={1}
		>
			<Text color="#F0DB4F">
				User Name : {userInfo.username} <Newline />
			</Text>
			<Text color="green">
				Correctly Answered : {userInfo.correctlyAnswered.length}
			</Text>
			<Text color="red">
				Incorrectly Answered : {userInfo.incorrectlyAnswered.length}
			</Text>
			<Text color="#F0DB4F">Total Question : {totalQn}</Text>
			<Text>
				<Newline />
			</Text>
			<SelectInput
				items={[{ label: "Go Back To Menu", value: "wcs" }]}
				onSelect={item => {
					setPageToShow(item.value);
				}}
			/>
		</Box>
	);
};
const Completed = ({ userInfo, totalQn, setPageToShow }) => {
	return (
		<Box flexDirection="column" alignItems="center">
			<Text color="#F0DB4F">
				You Have Answered All of the Questions <Newline />
				Here are Your Stats
			</Text>
			<ScoreBoard
				setPageToShow={setPageToShow}
				userInfo={userInfo}
				totalQn={totalQn}
			/>
		</Box>
	);
};
const Question = ({
	question,
	qta,

	userInfo,
	setUserInfo,
	setPageToShow
}) => {
	const [ansState, setAnsState] = useState(0);
	const [isCorrect, setIsCorrect] = useState(false);
	const handleSelect = item => {
		setAnsState(1);
		if (item.value === question.answer) {
			writeUserInfo({
				...userInfo,

				correctlyAnswered: [...userInfo.correctlyAnswered, question.id]
			})
				.then(data => {
					setIsCorrect(true);
					setUserInfo(data);
				})
				.catch(err => console.log(err));
		} else {
			writeUserInfo({
				...userInfo,

				incorrectlyAnswered: [...userInfo.incorrectlyAnswered, question.id]
			})
				.then(data => {
					setIsCorrect(false);
					setUserInfo(data);
				})
				.catch(err => console.log(err));
		}
	};
	if (!question.id) return <Text></Text>;
	return (
		<Box
			flexDirection="column"
			padding={1}
			borderStyle="round"
			borderColor="#F0DB4F"
		>
			<Text>
				{question.id}. {question.title}
				<Newline />
			</Text>
			{question.question ? (
				<Box padding={1} borderStyle="singleDouble" borderColor="yellow">
					<Markdown code="green">{question.question}</Markdown>
				</Box>
			) : (
				<Text></Text>
			)}
			<Text>
				<Newline />
			</Text>
			<SelectInput
				items={question.choices.map(c => ({
					label: c.choice + "." + c.label,
					value: c.choice
				}))}
				isFocused={!ansState}
				onSelect={handleSelect}
			/>
			{ansState ? (
				<Box flexDirection="column">
					<Text>
						<Newline />
						<Text inverse color={isCorrect ? "green" : "red"}>
							Your are {isCorrect ? "correct " : "incorrect "}
							<Newline />
						</Text>
						Answer : {question.answer}
						<Newline />
					</Text>

					<Box
						padding={1}
						borderStyle="singleDouble"
						borderColor="yellow"
						flexDirection="column"
					>
						<Text>
							Explanation
							<Newline />
						</Text>
						<Markdown>{question.explanation}</Markdown>
					</Box>
					<Text>
						<Newline />
						Next Question ?
						<Newline />
					</Text>
					<SelectInput
						items={[
							{ label: "Yes", value: 1 },
							{ label: "No", value: 0 }
						]}
						onSelect={item => {
							if (item.value) {
								writeUserInfo({ ...userInfo, lastQnIndex: qta + 1 })
									.then(data => {
										setUserInfo(data);
										setAnsState(0);
									})
									.catch(err => console.log(err));
							} else {
								setPageToShow("ws");
							}
						}}
					/>
				</Box>
			) : (
				<Text></Text>
			)}
		</Box>
	);
};
const App = () => {
	console.log(__dirname);
	const questions = getQuestions();

	const [userInfo, setUserInfo] = useState({});
	const [pageToShow, setPageToShow] = useState("wcs");
	const [qta, setQta] = useState(0);

	useDeepCompareEffect(() => {
		loadUserInfo()
			.then(data => {
				setUserInfo(data);
				setQta(data.lastQnIndex);
			})
			.catch(err => console.log(err));
	}, [userInfo]);

	if (!questions) {
		return <Text>questions.md file not found</Text>;
	}
	if (pageToShow === "qn") {
		const question = questions[qta];
		//console.log(question.id);
		if (qta >= questions.length)
			return (
				<Completed
					setPageToShow={setPageToShow}
					totalQn={questions.length}
					userInfo={userInfo}
				/>
			);
		return (
			<Question
				question={question}
				qta={qta}
				userInfo={userInfo}
				setQta={setQta}
				setUserInfo={setUserInfo}
				setPageToShow={setPageToShow}
			/>
		);
	} else if (pageToShow === "sb") {
		return (
			<ScoreBoard
				totalQn={questions.length}
				userInfo={userInfo}
				setPageToShow={setPageToShow}
			/>
		);
	} else if (pageToShow === "wcs") {
		return (
			<WelcomeScreen
				setUserInfo={setUserInfo}
				userInfo={userInfo}
				setPageToShow={setPageToShow}
			/>
		);
	}
	return (
		<WelcomeScreen
			setUserInfo={setUserInfo}
			userInfo={userInfo}
			setPageToShow={setPageToShow}
		/>
	);
};

module.exports = App;
