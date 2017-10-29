/*
	Simple Parser used to strip block and line comments form a
	JSON formatted string.

	Worth knowing: The parser treat " and ' the same, so it´s
	possible to start a string with " and end it with '

	This file is part of the TypeScript Path Igniter Project:
	https://github.com/duffman/ts-path-igniter

	@Author: Patrik Forsberg <patrik.forsberg@coldmind.com>
	@Date: 2017-09-02
 */

let fs = require("fs");

enum JsonParserState {
	None,
	InLineComment,
	InBlockComment,
	InObject,
	InQuote
};

export class JsonCommentStripper {
	currState = JsonParserState.None;
	prevtState = JsonParserState.None;

	constructor() {}

	public stripComments(data: string) {
		return this.parse(data);
	}

	parserStateToStr(state: JsonParserState): string {
		var strValue: string = "";

		switch (state) {
			case JsonParserState.None:
				strValue = "None";
				break;
			case JsonParserState.InQuote:
				strValue = "InQuote";
				break;
			case JsonParserState.InBlockComment:
				strValue = "InBlockComment";
				break;
			case JsonParserState.InLineComment:
				strValue = "InLineComment";
				break;
			case JsonParserState.InObject:
				strValue = "InObject";
				break;
			default:
				strValue = "Unknown";
				break;
		}

		return strValue;
	}

	isQuote (char: string): boolean {
		return (char == "\"" || char == "'");
	}

	setState(state: JsonParserState) {
		if (state != this.currState) {
			this.prevtState = this.currState;
			this.currState = state;
		}
	}

	inState(state: JsonParserState) {
		return this.currState == state;
	}

	setPrevState () {
		this.setState(this.prevtState);
	}

	inComment(): boolean {
		return this.inState(JsonParserState.InLineComment)
			|| this.inState(JsonParserState.InBlockComment);
	}

	parse(data: string): string {
		var lineNum = 1;
		var linePos = 1;

		var prevChar = "";
		var currChar = "";
		var aheadChar = "";

		var chunk = "";

		for (var i = 0; i < data.length; i++) {
			prevChar = currChar;
			currChar = data[i];
			aheadChar = data[i + 1];

			linePos++;

			if (currChar == "\n") {
				if (this.inState(JsonParserState.InLineComment)) {
					this.setState(JsonParserState.None);
				}

				linePos = 1;
				lineNum++;
			}

			// Allow block comments everywhere except in quotes
			if (currChar == "/" && aheadChar == "*" && !this.inState(JsonParserState.InQuote)) {
				i++;
				this.setState(JsonParserState.InBlockComment);
				continue;
			}

			if (currChar == "/" && aheadChar == "/" && this.inState(JsonParserState.None)) {
				i++;
				this.setState(JsonParserState.InLineComment);
				continue;
			}

			// If this is an end block comment, return to the previous state
			if (currChar == "*" && aheadChar == "/" && this.inState(JsonParserState.InBlockComment)) {
				i++;
				this.setPrevState();
				continue;
			}

			if (this.isQuote(currChar) && this.inState(JsonParserState.None)) {
				this.setState(JsonParserState.InQuote);
			}

			else if (this.isQuote(currChar) && this.inState(JsonParserState.InQuote)) {
				this.setState(JsonParserState.None);
			}

			if (!this.inComment())
				chunk += currChar;
		}

		return chunk;
	}
}