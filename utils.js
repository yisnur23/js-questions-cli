const fs = require("fs");

const cleanup = s => s.trim().replace(/<i>(.*)<\/i>|<em>(.*)<\/em>/, "*$1*");

const getQuestions = () => {
	if (!fs.existsSync("questions.md")) {
		return;
	}
	const fileContents = fs.readFileSync("questions.md", "utf8");
	return fileContents
		.split(/---|\* \* \* \* \*/)
		.slice(1)
		.map(s => s && s.trim())
		.filter(s => !!s)
		.map(section => {
			try {
				const [, title, question, choices, answer, explanation] = section.match(
					/######\s*(.*?)\s*\n\s*(.*?)\s*((?:[-*]\s*[A-Z]: .*?)+)\s*<details>.*?#### .*?: ([A-Z])\n(.*?)<\/p>\s*<\/details>/ms
				);
				return {
					id: cleanup(title).split(". ")[0],
					title: cleanup(title).split(". ")[1],
					question: cleanup(question),
					choices: choices.split("\n").map(s => {
						try {
							const [, choice, label] = s.match(/^[-*]\s*([A-Z]):\s*(.+?)\s*$/);
							return { choice, label: cleanup(label) };
						} catch (err) {
							console.log({ s });
							throw err;
						}
					}),
					answer: cleanup(answer),
					explanation: cleanup(explanation)
				};
			} catch (err) {
				console.log({ section });
				throw err;
			}
		});
};

const loadUserInfo = async () => {
	if (fs.existsSync("user-info.json")) {
		const userInfo = await fs.promises.readFile("user-info.json");
		return JSON.parse(userInfo);
	} else {
		const userInfo = {
			username: "",
			correctlyAnswered: [],
			incorrectlyAnswered: [],
			lastQnIndex: 0
		};
		await fs.promises.writeFile("user-info.json", JSON.stringify(userInfo));
		return await loadUserInfo();
	}
};
const writeUserInfo = async userInfo => {
	await fs.promises.writeFile("user-info.json", JSON.stringify(userInfo));
	return await loadUserInfo();
};
module.exports = {
	getQuestions,
	loadUserInfo,
	writeUserInfo
};
